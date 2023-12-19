import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Images } from "../constants/Images";
import { Colors } from "../constants/Colors";
import { ColorsArray } from "../constants/Constants";
import CustomAlert from "../components/CustomAlert";

interface Note {
  title: string;
  content: string;
  color: string;
}

const width = Dimensions.get("window").width;

const Notes: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [color, setColor] = useState<string>(Colors.METALIC);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  const translateYAnim = useRef(new Animated.Value(300)).current;

  const openAlert = () => {
    setShowAlert(true);
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem("data", JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Error saving notes:", e);
    }
  };

  const fetchNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("data");
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      console.error("Error fetching notes:", e);
    }
  };
  const toggleVisibility = (value: boolean) => {
    Animated.timing(translateYAnim, {
      toValue: !value ? 300 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const addNote = () => {
    if (title.trim() !== "" || content.trim() !== "") {
      if (editIndex !== null) {
        const updatedNotes = [...notes];
        updatedNotes[editIndex] = { title, content, color };
        saveNotes(updatedNotes);
        setNotes(updatedNotes);
        setEditIndex(null);
      } else {
        const newNote = { title, content, color };
        saveNotes([newNote, ...notes]);
        setNotes([newNote, ...notes]);
      }
      setTitle("");
      setContent("");
      setColor(Colors.METALIC);
    }
  };

  const deleteNote = () => {
    const updatedNotes = [...notes];
    updatedNotes.splice(deleteIndex!, 1);
    saveNotes(updatedNotes);
    setNotes(updatedNotes);
    setShowAlert(false);
  };

  const openEditModal = (index: number) => {
    const note = notes[index];
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setEditIndex(index);
    setIsModalVisible(true);
  };

  const chooseColor = (chosenColor: string) => {
    setColor(chosenColor);
  };

  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    return (
      <View>
        <TouchableOpacity
          style={[styles.noteItem, { backgroundColor: item.color }]}
          onPress={() => openEditModal(index)}
        >
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={{ color: Colors.LIGHT_GREY }}>{item.content}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setDeleteIndex(index), openAlert();
          }}
          style={styles.deleteButton}
        >
          <Text style={{ color: Colors.WHITE }}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search your notes"
        placeholderTextColor={Colors.GRAY}
        value={searchQuery}
        onChangeText={(text: React.SetStateAction<string>) =>
          setSearchQuery(text)
        }
      />
      <CustomAlert
        isVisible={showAlert}
        message="Are you sure you want to delete this note"
        onClose={closeAlert}
        onDelete={deleteNote}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          setIsModalVisible(true), toggleVisibility(false);
        }}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item: any, index: { toString: () => any }) =>
          index.toString()
        }
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No notes available</Text>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={() => toggleVisibility(false)}>
          <KeyboardAvoidingView
            behavior="padding"
            style={[styles.inputContainer, { backgroundColor: color }]}
          >
            <SafeAreaView
              style={[styles.inputContainer, { backgroundColor: color }]}
            >
              <TouchableOpacity
                onPress={() => {
                  addNote(), setIsModalVisible(false);
                }}
              >
                <Image source={Images.back} style={styles.back} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                placeholderTextColor={Colors.LIGHT_GREY}
                onChangeText={(text: React.SetStateAction<string>) =>
                  setTitle(text)
                }
              />
              <TextInput
                style={styles.input2}
                placeholder="Note"
                value={content}
                placeholderTextColor={Colors.LIGHT_GREY}
                onChangeText={(text: React.SetStateAction<string>) =>
                  setContent(text)
                }
                multiline
              />
              <View style={styles.bottomView}>
                <TouchableOpacity
                  onPress={() => toggleVisibility(true)}
                  style={styles.closeButton}
                >
                  <Image
                    source={Images.colorPicker}
                    style={styles.pickerImage}
                  />
                </TouchableOpacity>
              </View>
              <Animated.View
                style={[
                  styles.animatedView,
                  {
                    transform: [{ translateY: translateYAnim }],
                    backgroundColor: color,
                  },
                ]}
              >
                <View style={styles.colour}>
                  <Text style={{ color: Colors.LIGHT_GREY }}>Colour</Text>
                </View>

                <FlatList
                  data={ColorsArray}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item: any, index: { toString: () => any }) =>
                    index.toString()
                  }
                  renderItem={(item: { item: { color: string } }) => {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.colorOption,
                          { backgroundColor: item?.item?.color },
                        ]}
                        onPress={() => chooseColor(item?.item?.color)}
                      >
                        {item?.item?.color === color && (
                          <Image source={Images.tick} style={styles.tick} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />

                <View style={styles.colorOptionsContainer}></View>
              </Animated.View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: Colors.LIGHT_BLACK,
  },
  inputContainer: {
    paddingHorizontal: Platform.OS === "ios" ? "4%" : "3%",
    paddingVertical: 15,
    flex: 1,
  },
  input: {
    padding: 10,
    fontSize: 20,
    color: Colors.LIGHT_GREY,
  },
  input2: {
    padding: 10,
    color: Colors.LIGHT_GREY,
  },
  colorOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 25,
    borderWidth: 0.5,
    borderColor: "grey",
    marginHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "25%",
  },
  emptyListText: {
    fontSize: 18,
    color: Colors.GRAY,
  },
  noteItem: {
    borderWidth: 0.4,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: Colors.WHITE,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  noteTitle: {
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 18,
    color: Colors.WHITE,
  },
  animatedView: {
    position: "absolute",
    bottom: 0,
    width: width,
    padding: 20,
    backgroundColor: Colors.RAISN_BLACK,
    borderTopWidth: 0.5,
    alignSelf: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    borderWidth: 1,
    borderColor: Colors.WHITE,
    borderRadius: 50,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff5a5f",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    zIndex: 999,
  },
  floatingButtonText: {
    color: Colors.WHITE,
    fontSize: 40,
    lineHeight: 40,
  },

  bottomView: {
    position: "absolute",
    bottom: 20,
  },
  closeButton: {
    borderRadius: 20,
    padding: 10,
  },
  textStyle: {
    color: Colors.WHITE,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: Colors.METALIC,
    color: Colors.GRAY,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  back: {
    height: 30,
    width: 30,
    tintColor: Colors.LIGHT_GREY,
    resizeMode: "contain",
  },
  colour: {
    justifyContent: "flex-start",
    paddingBottom: 10,
  },
  tick: {
    height: 20,
    width: 20,
    tintColor: Colors.LIGHT_GREY,
    resizeMode: "contain",
  },
  pickerImage: {
    height: 30,
    width: 30,
    tintColor: Colors.LIGHT_GREY,
  },
});

export default Notes;
