import { View, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export default function HomeScreen() {
  return (
    <WebView
      style={{ flex: 1 }}
      source={{ uri: "https://www.lc01.cn" }}
      onLoadStart={() => console.log("🔄 开始加载......")}
      onLoadProgress={({ nativeEvent }) => {
        console.log("⏳ 加载进度:", nativeEvent.progress);
      }}
      onLoadEnd={() => console.log("✅ 加载结束")}
      onLoad={() => console.log("✅ 页面加载完成")}
      onError={(syntheticEvent) => {
        console.error("❌ WebView 错误:", syntheticEvent.nativeEvent);
      }}
      onHttpError={(syntheticEvent) => {
        console.error("❌ HTTP 错误:", syntheticEvent.nativeEvent.statusCode);
      }}
      renderError={(errorName) => (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>加载失败: {errorName}</Text>
        </View>
      )}
      renderLoading={() => (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
          <Text>加载中...</Text>
        </View>
      )}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scalesPageToFit={true}
      originWhitelist={["*"]}
    />
  );
}
