import { LinkProps, Text } from "../../theme";

export default function Link({ url, text, ...rest }: LinkProps) {
  if (!text && !url) {
    throw new Error("text or url is mandatory for Link widget");
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="tap-link">
      <Text {...rest} text={text ?? url ?? ""} />
    </a>
  );
}
