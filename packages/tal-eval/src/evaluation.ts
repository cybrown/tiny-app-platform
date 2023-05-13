import {
  ArgumentExpression,
  CallExpression,
  Expression,
  ExpressionLocation,
  isExpr,
} from 'tal-parser';
import {
  FunctionValue,
  RegisterableFunction,
  RuntimeContext,
  isFunctionValue,
} from './RuntimeContext';

export function evaluateCall(
  ctx: RuntimeContext,
  func: any,
  args: ArgumentExpression[]
) {
  const providedNamedArguments = Object.fromEntries(
    args
      .filter(a => a.argKind === 'Named')
      .map(
        it =>
          (it.argKind === 'Named' ? [it.name, it.value] : []) as [
            string,
            Expression
          ]
      )
  );
  const positionalArguments = args
    .filter(a => a.argKind === 'Positional')
    .map(({ value }) => value);

  if (
    func &&
    ((func.call && typeof func.call == 'function') ||
      (func.callAsync && typeof func.callAsync == 'function'))
  ) {
    const consolidatedProvidedAndMissingArguments = {
      ...providedNamedArguments,
    };
    const missingDeclaredNamedParametersBeforeEnvironment = (func as RegisterableFunction).parameters.filter(
      parameter => !providedNamedArguments.hasOwnProperty(parameter.name)
    );

    // check parameters with export name and set value from context if exists
    const namedArgumentsEvaluated: { [key: string]: unknown } = {};
    missingDeclaredNamedParametersBeforeEnvironment.forEach(param => {
      if (param.env) {
        const localExportedValue = ctx.getEnv(param.env);
        if (localExportedValue != null) {
          namedArgumentsEvaluated[param.name] = localExportedValue;
        }
      }
    });
    const missingDeclaredNamedParameters = missingDeclaredNamedParametersBeforeEnvironment.filter(
      parameter => !namedArgumentsEvaluated.hasOwnProperty(parameter.name)
    );

    for (
      let paramIndex = 0;
      paramIndex <
      Math.min(
        positionalArguments.length,
        missingDeclaredNamedParameters.length
      );
      paramIndex++
    ) {
      const param = missingDeclaredNamedParameters[paramIndex];
      consolidatedProvidedAndMissingArguments[param.name] =
        positionalArguments[paramIndex];
    }
    const remainingPositionalArguments = positionalArguments
      .slice(missingDeclaredNamedParameters.length)
      .map(arg => ctx.evaluate(arg));
    for (var argName of Object.keys(consolidatedProvidedAndMissingArguments)) {
      const isArgLazy = !!(func.parametersByName[argName] ?? {}).lazy;
      namedArgumentsEvaluated[argName] = isArgLazy
        ? consolidatedProvidedAndMissingArguments[argName]
        : ctx.evaluate(consolidatedProvidedAndMissingArguments[argName]);
    }
    if (!func.call) {
      throw new Error(
        'Function is not available in non async execution context'
      );
    }
    return func.call(
      ctx,
      namedArgumentsEvaluated,
      remainingPositionalArguments
    );
  } else if (isFunctionValue(func)) {
    const finalNamedArgumentsEvaluated: Record<string, unknown> = {};
    let counter = 0;
    for (let parameter of func.func.parameters) {
      if (providedNamedArguments.hasOwnProperty(parameter)) {
        finalNamedArgumentsEvaluated[parameter] = ctx.evaluate(
          providedNamedArguments[parameter]
        );
      } else if (positionalArguments.length > counter) {
        finalNamedArgumentsEvaluated[parameter] = ctx.evaluate(
          positionalArguments[counter]
        );
        counter++;
      }
    }
    if (isExpr(func.func.body, 'BlockOfExpressions')) {
      func.func.body.mustKeepContext = true;
    }
    let childContext = func.ctx
      .createChild(finalNamedArgumentsEvaluated, false)
      .createChild({});
    return childContext.evaluate(func.func.body);
  } else {
    console.error(func);
    throw new Error('Call not supported');
  }
}

export function evaluateExpression(
  ctx: RuntimeContext,
  value: Expression
): unknown {
  try {
    switch (value.kind) {
      // Core interactions
      case 'Literal':
        return value.value;
      case 'Value':
        return value.value;
      case 'Array':
        return value.value.map(element => ctx.evaluate(element));
      case 'Object':
        return Object.fromEntries(
          Object.entries(value.value).map(([key, subValue]) => [
            key,
            ctx.evaluate(subValue as any),
          ])
        );
      case 'Local':
        return ctx.getLocal(value.name);
      case 'DeclareLocal': {
        const options: { initialValue?: unknown; mutable: boolean } = {
          mutable: value.mutable,
        };
        if (value.value !== undefined) {
          options.initialValue = ctx.evaluate(value.value);
        }
        ctx.declareLocal(value.name, options);
        return;
      }
      case 'SetValue': {
        const content = ctx.evaluate(value.value);
        ctx.setValue(value.address, content);
        return content;
      }
      case 'Quote': {
        return value.children[0];
      }
      case 'Function': {
        const functionValue: FunctionValue = {
          __kind: 'FunctionValue',
          func: value,
          ctx,
        };
        return functionValue;
      }
      case 'Call': {
        const func = ctx.evaluate(value.value) as any;
        return evaluateCall(ctx, func, value.args);
      }

      // Expression
      case 'SubExpression':
        return ctx.evaluate(value.expr);
      case 'Attribute':
        return (ctx.evaluate(value.value) as any)[value.key];
      case 'Index':
        return (ctx.evaluate(value.value) as any)[
          ctx.evaluate(value.index) as any
        ];
      case 'Pipe': {
        let previousError = null;
        let previousValue: Expression | null = null;
        try {
          previousValue = {
            location: locationOf(value.first),
            kind: 'Value',
            value: ctx.evaluate(value.first),
          };
        } catch (err) {
          previousError = err;
        }
        for (let { value: current, pipeKind } of value.values) {
          if ((pipeKind === '|' || pipeKind === '|?') && previousError) {
            continue;
          }
          if (pipeKind === '|?' && previousValue?.value == null) {
            continue;
          }
          if (pipeKind === '|!' && !previousError) {
            continue;
          }
          if (typeof current != 'object' || !current) {
            throw new Error('Only object ast nodes are supported in pipes');
          }
          let callCurrentExpression: Expression;
          if (Array.isArray(current) || current.kind !== 'Call') {
            callCurrentExpression = {
              location: locationOf(current),
              kind: 'Call',
              value: current,
              args: [],
            };
          } else {
            callCurrentExpression = current;
          }
          if (!previousValue) {
            throw new Error('previousValue must not be null');
          }
          const newCurrent: CallExpression = {
            ...callCurrentExpression,
            args: [
              {
                argKind: 'Positional',
                value: previousValue,
              },
              ...callCurrentExpression.args,
            ],
          };
          try {
            previousValue = {
              location: locationOf(newCurrent),
              kind: 'Value',
              value: ctx.evaluate(newCurrent),
            };
            previousError = null;
          } catch (err) {
            previousError = err;
          }
        }
        if (previousError) {
          throw previousError;
        }
        return previousValue?.value;
      }
      case 'UnaryOperator': {
        const operand = ctx.evaluate(value.operand);
        const operator = value.operator;
        switch (operator) {
          case '-':
            return -(operand as any);
          case '+':
            return +(operand as any);
          case '!':
            return !operand;
          default:
            throw new Error('Unknown unary operator: ' + operator);
        }
      }
      case 'BinaryOperator': {
        const operator = value.operator;
        switch (operator) {
          case '*':
            return (
              (ctx.evaluate(value.left) as any) *
              (ctx.evaluate(value.right) as any)
            );
          case '/':
            return (
              (ctx.evaluate(value.left) as any) /
              (ctx.evaluate(value.right) as any)
            );
          case '%':
            return (
              (ctx.evaluate(value.left) as any) %
              (ctx.evaluate(value.right) as any)
            );
          case '+':
            return (
              (ctx.evaluate(value.left) as any) +
              (ctx.evaluate(value.right) as any)
            );
          case '-':
            return (
              (ctx.evaluate(value.left) as any) -
              (ctx.evaluate(value.right) as any)
            );
          case '<':
            return (
              (ctx.evaluate(value.left) as any) <
              (ctx.evaluate(value.right) as any)
            );
          case '<=':
            return (
              (ctx.evaluate(value.left) as any) <=
              (ctx.evaluate(value.right) as any)
            );
          case '>':
            return (
              (ctx.evaluate(value.left) as any) >
              (ctx.evaluate(value.right) as any)
            );
          case '>=':
            return (
              (ctx.evaluate(value.left) as any) >=
              (ctx.evaluate(value.right) as any)
            );
          case '==':
            return (
              (ctx.evaluate(value.left) as any) ===
              (ctx.evaluate(value.right) as any)
            );
          case '!=':
            return (
              (ctx.evaluate(value.left) as any) !==
              (ctx.evaluate(value.right) as any)
            );
          case '&&':
            return (
              (ctx.evaluate(value.left) as any) &&
              (ctx.evaluate(value.right) as any)
            );
          case '||':
            return (
              (ctx.evaluate(value.left) as any) ||
              (ctx.evaluate(value.right) as any)
            );
          default:
            throw new Error('Unknown binary operator: ' + operator);
        }
      }
      case 'BlockOfExpressions': {
        let lastValue = null;
        const contextToUse = value.mustKeepContext ? ctx : ctx.createChild({});
        for (let expression of value.children ?? []) {
          lastValue = contextToUse.evaluate(expression);
        }
        return lastValue;
      }

      // UI Widgets
      case 'KindedObject': {
        const valueAsUiWidget = value.value as any;
        if (ctx.getWidgetByKind(valueAsUiWidget.kind) != null) {
          return {
            kind: valueAsUiWidget.kind,
            ctx,
            children: valueAsUiWidget.children,
            bindTo: valueAsUiWidget.bindTo,
            ...Object.fromEntries(
              Object.entries(valueAsUiWidget)
                .filter(
                  ([key]) =>
                    !['kind', 'ctx', 'children', 'bindTo'].includes(key)
                )
                .map(([key, value]) => [key, ctx.evaluate(value as any)])
            ),
          };
        } else if (ctx.hasLocal(valueAsUiWidget.kind)) {
          const value = ctx.getLocal(valueAsUiWidget.kind) as FunctionValue;
          if (!value.__kind) {
            throw new Error('Only function values can be used as UI Widgets');
          }
          return ctx.callFunction(value, [], {
            children: valueAsUiWidget.children,
            bindTo: valueAsUiWidget.bindTo,
            ...Object.fromEntries(
              Object.entries(valueAsUiWidget)
                .filter(
                  ([key]) =>
                    !['kind', 'ctx', 'children', 'bindTo'].includes(key)
                )
                .map(([key, value]) => [key, ctx.evaluate(value as any)])
            ),
          });
        } else {
          throw new Error('Unknown KindedObject: ' + valueAsUiWidget.kind);
        }
      }
    }
    throw new Error(
      'Failed to evaluate node with kind: ' + (value as any).kind
    );
  } catch (err) {
    if (err instanceof EvaluationError) {
      throw err;
    }
    throw new EvaluationError((err as any)?.message, value, err);
  }
}

export async function evaluateAsyncExpression(
  ctx: RuntimeContext,
  value: Expression
): Promise<unknown> {
  try {
    if (value && typeof value == 'object' && value.kind) {
      switch (value.kind) {
        case 'DeclareLocal': {
          const options: { initialValue?: unknown; mutable: boolean } = {
            mutable: value.mutable,
          };
          if (value.value !== undefined) {
            options.initialValue = await ctx.evaluateAsync(value.value);
          }
          ctx.declareLocal(value.name, options);
          return;
        }
        case 'SetValue': {
          const content = await ctx.evaluateAsync(value.value);
          ctx.setValue(value.address, content);
          return content;
        }
        case 'BlockOfExpressions': {
          let lastValue = null;
          const childContext = ctx.createChild({});
          for (let expression of value.children ?? []) {
            lastValue = await childContext.evaluateAsync(expression);
          }
          return lastValue;
        }
        case 'Pipe': {
          let previousError = null;
          let previousValue: Expression | null = null;
          try {
            previousValue = {
              location: locationOf(value.first),
              kind: 'Value',
              value: await ctx.evaluateAsync(value.first),
            };
            previousError = null;
          } catch (err) {
            previousError = err;
          }
          for (let { value: current, pipeKind } of value.values) {
            if ((pipeKind === '|' || pipeKind === '|?') && previousError) {
              continue;
            }
            if (pipeKind === '|?' && previousValue == null) {
              continue;
            }
            if (pipeKind === '|!' && !previousError) {
              continue;
            }
            if (typeof current != 'object' || !current) {
              throw new Error('Only object ast nodes are supported in pipes');
            }
            let callCurrentExpression: Expression;
            if (current.kind !== 'Call') {
              callCurrentExpression = {
                location: locationOf(current),
                kind: 'Call',
                value: current,
                args: [],
              };
            } else {
              callCurrentExpression = current;
            }
            if (!previousValue) {
              throw new Error('previousValue must not be null');
            }
            const newCurrent: CallExpression = {
              ...callCurrentExpression,
              args: [
                {
                  argKind: 'Positional',
                  value: previousValue,
                },
                ...callCurrentExpression.args,
              ],
            };
            try {
              previousValue = {
                location: locationOf(newCurrent),
                kind: 'Value',
                value: await ctx.evaluateAsync(newCurrent),
              };
              previousError = null;
            } catch (err) {
              previousError = err;
            }
          }
          if (previousError) {
            throw previousError;
          }
          return previousValue?.value;
        }
        case 'Attribute':
          return ((await ctx.evaluateAsync(value.value)) as any)[value.key];
        case 'Index':
          return ((await ctx.evaluateAsync(value.value)) as any)[
            (await ctx.evaluateAsync(value.index)) as any
          ];
        case 'SubExpression':
          return await ctx.evaluateAsync(value.expr);
        case 'Call': {
          const func = (await ctx.evaluateAsync(value.value)) as any;
          const providedNamedArguments = Object.fromEntries(
            value.args
              .filter(a => a.argKind === 'Named')
              .map(
                it =>
                  (it.argKind === 'Named' ? [it.name, it.value] : []) as [
                    string,
                    Expression
                  ]
              )
          );
          const positionalArguments = value.args
            .filter(a => a.argKind === 'Positional')
            .map(({ value }) => value);

          if (
            func &&
            ((func.call && typeof func.call == 'function') ||
              (func.callAsync && typeof func.callAsync == 'function'))
          ) {
            const consolidatedProvidedAndMissingArguments = {
              ...providedNamedArguments,
            };
            const missingDeclaredNamedParametersBeforeEnvironment = (func as RegisterableFunction).parameters.filter(
              parameter =>
                !providedNamedArguments.hasOwnProperty(parameter.name)
            );

            // check parameters with export name and set value from context if exists
            const namedArgumentsEvaluated: { [key: string]: unknown } = {};
            missingDeclaredNamedParametersBeforeEnvironment.forEach(param => {
              if (param.env) {
                const localExportedValue = ctx.getEnv(param.env);
                if (localExportedValue != null) {
                  namedArgumentsEvaluated[param.name] = localExportedValue;
                }
              }
            });
            const missingDeclaredNamedParameters = missingDeclaredNamedParametersBeforeEnvironment.filter(
              parameter =>
                !namedArgumentsEvaluated.hasOwnProperty(parameter.name)
            );

            for (
              let paramIndex = 0;
              paramIndex <
              Math.min(
                positionalArguments.length,
                missingDeclaredNamedParameters.length
              );
              paramIndex++
            ) {
              const param = missingDeclaredNamedParameters[paramIndex];
              consolidatedProvidedAndMissingArguments[param.name] =
                positionalArguments[paramIndex];
            }
            const remainingPositionalArguments = await Promise.all(
              positionalArguments
                .slice(missingDeclaredNamedParameters.length)
                .map(arg => ctx.evaluateAsync(arg))
            );
            for (var argName of Object.keys(
              consolidatedProvidedAndMissingArguments
            )) {
              const isArgLazy = !!(func.parametersByName[argName] ?? {}).lazy;
              namedArgumentsEvaluated[argName] = isArgLazy
                ? consolidatedProvidedAndMissingArguments[argName]
                : await ctx.evaluateAsync(
                    consolidatedProvidedAndMissingArguments[argName]
                  );
            }
            return await (func.callAsync ?? func.call)(
              ctx,
              namedArgumentsEvaluated,
              remainingPositionalArguments
            );
          } else if (isFunctionValue(func)) {
            const finalNamedArgumentsEvaluated: Record<string, unknown> = {};
            let counter = 0;
            for (let parameter of func.func.parameters) {
              if (providedNamedArguments.hasOwnProperty(parameter)) {
                finalNamedArgumentsEvaluated[
                  parameter
                ] = await ctx.evaluateAsync(providedNamedArguments[parameter]);
              } else if (positionalArguments.length > counter) {
                finalNamedArgumentsEvaluated[
                  parameter
                ] = await ctx.evaluateAsync(positionalArguments[counter]);
                counter++;
              }
            }
            return await func.ctx
              .createChild(finalNamedArgumentsEvaluated)
              .evaluateAsync(func.func.body);
          } else {
            console.error(func);
            throw new Error('Call not supported');
          }
        }
        case 'UnaryOperator': {
          const operand = (await ctx.evaluateAsync(value.operand)) as any;
          const operator = value.operator;
          switch (operator) {
            case '-':
              return -(await operand);
            case '+':
              return +(await operand);
            case '!':
              return !(await operand);
            default:
              throw new Error('Unknown unary operator: ' + operator);
          }
        }
        case 'BinaryOperator': {
          const operator = value.operator;
          switch (operator) {
            case '*':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) *
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '/':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) /
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '%':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) %
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '+':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) +
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '-':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) -
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '<':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) <
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '<=':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) <=
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '>':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) >
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '>=':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) >=
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '==':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) ===
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '!=':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) !==
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '&&':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) &&
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            case '||':
              return (
                ((await ctx.evaluateAsync(value.left)) as any) ||
                ((await ctx.evaluateAsync(value.right)) as any)
              );
            default:
              throw new Error('Unknown binary operator: ' + operator);
          }
        }
      }
    }
  } catch (err) {
    if (err instanceof EvaluationError) {
      throw err;
    }
    throw new EvaluationError((err as any)?.message, value, err);
  }
  return ctx.evaluate(value);
}

export class EvaluationError extends Error {
  constructor(
    message: string,
    public readonly expression: Expression,
    public readonly cause: unknown
  ) {
    super(message);
  }
}

function locationOf(expression: Expression): ExpressionLocation | undefined {
  if (expression && typeof expression == 'object') {
    return expression.location;
  }
  return undefined;
}
