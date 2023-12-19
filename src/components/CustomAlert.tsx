import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { Colors } from "../constants/Colors";

interface CustomAlertProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  onDelete: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isVisible,
  message,
  onClose,
  onDelete,
}) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut">
      <View style={styles.modalContent}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.mainButtonsView}>
          <TouchableOpacity onPress={onDelete} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton2}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    marginHorizontal: 20,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.LIGHT_GREY,
    borderRadius: 5,
  },
  closeButton2: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ff5a5f",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  mainButtonsView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
});

export default CustomAlert;
