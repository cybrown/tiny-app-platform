import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react";
import styles from "./notifications.module.css";
import { Button, Text } from "../theme";

type NotificationState = {
  notifications: Record<string, ReactNode>;
  list: string[];
};

type NotificationAction =
  | { kind: "NOTIFY"; message: ReactNode }
  | { kind: "REMOVE"; id: string }
  | { kind: "CLEAR" };

type NotificationController = {
  notify(message: ReactNode): void;
  remove(id: string): void;
  clear(): void;
};

function notificationControllerBuilder(
  dispatcher: React.Dispatch<NotificationAction>
): NotificationController {
  return {
    clear() {
      setTimeout(() => {
        dispatcher({ kind: "CLEAR" });
      });
    },
    notify(message: ReactNode) {
      setTimeout(() => {
        dispatcher({ kind: "NOTIFY", message });
      });
    },
    remove(id: string) {
      setTimeout(() => {
        dispatcher({ kind: "REMOVE", id });
      });
    },
  };
}

function useNotificationBase() {
  return useReducer(
    (state: NotificationState, action: NotificationAction) => {
      switch (action.kind) {
        case "NOTIFY": {
          const id = Math.random().toString();
          return {
            notifications: { ...state.notifications, [id]: action.message },
            list: [...state.list, id],
          };
        }
        case "REMOVE": {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [action.id]: _, ...notifications } = state.notifications;
          return {
            notifications: { ...notifications },
            list: state.list.filter((id) => id !== action.id),
          };
        }
        case "CLEAR":
          return { notifications: {}, list: [] };
      }
    },
    { notifications: {}, list: [] }
  );
}

export function useNotificationState() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("NotificationProvider not found");
  const [state] = ctx;
  return state;
}

export function useNotificationController() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("NotificationProvider not found");
  const [, dispatcher] = ctx;
  return useMemo(() => notificationControllerBuilder(dispatcher!), [
    dispatcher,
  ]);
}

const NotificationContext = createContext<ReturnType<
  typeof useNotificationBase
> | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationContext.Provider value={useNotificationBase()}>
      {children}
    </NotificationContext.Provider>
  );
}

const MAX_DISPLAYED_NOTIFICATIONS = 10;

export function NotificationDisplay() {
  const notificationController = useNotificationController();
  const notificationState = useNotificationState();
  return notificationState.list.length ? (
    <div className={styles.NotificationDisplay}>
      {notificationState.list.length > MAX_DISPLAYED_NOTIFICATIONS + 1 ? (
        <Text
          text={`${notificationState.list.length -
            MAX_DISPLAYED_NOTIFICATIONS} more notifications...`}
          align="center"
          color="rgb(167, 31, 60)"
          weight="bold"
          wrap
        />
      ) : notificationState.list.length === MAX_DISPLAYED_NOTIFICATIONS + 1 ? (
        <Text
          text="One more notification..."
          align="center"
          color="rgb(167, 31, 60)"
          weight="bold"
          wrap
        />
      ) : null}
      {notificationState.list.slice(-MAX_DISPLAYED_NOTIFICATIONS).map((id) => (
        <div key={id} className={styles.Notification}>
          {notificationState.notifications[id]}
          <Button
            text="Dismiss"
            onClick={() => notificationController.remove(id)}
          />
        </div>
      ))}
    </div>
  ) : null;
}
