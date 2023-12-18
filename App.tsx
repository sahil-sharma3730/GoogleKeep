import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Notes from "./src/screen/Notes";

const App = () => {
  return (
    <View style={styles.main}>
      <Notes />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});
