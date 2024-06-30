import { WindowFrame, View, Button, Text } from "../theme";
import ViewChild from "../widgets/ViewChild";
import LowLevelOverlay from "../widgets/internal/LowLevelOverlay";

type UpdateAppNotificationProps = {
  close: () => void;
};

export default function UpdateAppNotification({
  close,
}: UpdateAppNotificationProps) {
  return (
    <LowLevelOverlay modal position="center">
      <WindowFrame
        title="App updated"
        onClose={close}
        modal
        position="center"
        footer={
          <View layout="flex-row">
            <ViewChild flexGrow={1}> </ViewChild>
            <Button text="Later" outline onClick={close} />
            <Button
              text="Reload now"
              onClick={() => window.location.reload()}
            />
          </View>
        }
      >
        <View>
          <Text text="The source of this app has been updated." />
          <Text text="Reload the app now ?" />
          <Text
            text="(Reload later by refreshing this page.)"
            size={0.9}
            weight="light"
          />
        </View>
      </WindowFrame>
    </LowLevelOverlay>
  );
}
