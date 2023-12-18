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

interface Note {
  title: string;
  content: string;
  color: string;
}

const width = Dimensions.get("window").width;

const Colors = [
  { id: 1, color: "#2d2e31" },
  { id: 2, color: "#5b2b2a" },
  { id: 3, color: "#604a1d" },
  { id: 4, color: "#635c1f" },
  { id: 5, color: "#355853" },
  { id: 6, color: "#19504b" },
  { id: 7, color: "#21555d" },
  { id: 8, color: "#153b5e" },
];
const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [color, setColor] = useState<string>("#2d2e31");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const translateYAnim = useRef(new Animated.Value(300)).current;

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem("@notes", JSON.stringify(updatedNotes));
    } catch (e) {
      console.error("Error saving notes:", e);
    }
  };

  const fetchNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("@notes");
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
      setColor("#2d2e31");
    }
  };

  const deleteNote = (index: number) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    saveNotes(updatedNotes);
    setNotes(updatedNotes);
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

  useEffect(() => {
    fetchNotes();
  }, []);

  const renderItem = ({ item, index }: { item: Note; index: number }) => {
    return (
      <View>
        <TouchableOpacity
          style={[styles.noteItem, { backgroundColor: item.color }]}
          onPress={() => openEditModal(index)}
        >
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text style={{ color: "#b0b0b2" }}>{item.content}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deleteNote(index)}
          style={styles.deleteButton}
        >
          <Text style={{ color: "white" }}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search your notes"
        placeholderTextColor={"#888"}
        value={searchQuery}
        onChangeText={(text: React.SetStateAction<string>) =>
          setSearchQuery(text)
        }
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
                placeholderTextColor={"#ACACAC"}
                onChangeText={(text: React.SetStateAction<string>) =>
                  setTitle(text)
                }
              />
              <TextInput
                style={styles.input2}
                placeholder="Note"
                value={content}
                placeholderTextColor={"#ACACAC"}
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
                    style={{ height: 30, width: 30, tintColor: "#ACACAC" }}
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
                  <Text style={{ color: "#ACACAC" }}>Colour</Text>
                </View>

                <FlatList
                  data={Colors}
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
    backgroundColor: "#202124",
  },
  inputContainer: {
    paddingHorizontal: Platform.OS === "ios" ? "4%" : "3%",
    paddingVertical: 15,
    flex: 1,
  },
  input: {
    padding: 10,
    fontSize: 20,
    color: "#ACACAC",
  },
  input2: {
    padding: 10,
    color: "#ACACAC",
  },
  addButton: {
    backgroundColor: "#4caf50",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
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
  },
  emptyListText: {
    fontSize: 18,
    color: "#888",
  },
  noteItem: {
    borderWidth: 0.4,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  noteTitle: {
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 18,
    color: "#ffffff",
  },
  animatedView: {
    position: "absolute",
    bottom: 0,
    width: width,
    padding: 20,
    backgroundColor: "#232222",
    borderTopWidth: 0.5,
    alignSelf: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    borderWidth: 1,
    borderColor: "white",
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
    color: "#fff",
    fontSize: 40,
    lineHeight: 40,
  },

  bottomView: {
    position: "absolute",
    bottom: 20,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
  },
  closeButton: {
    borderRadius: 20,
    padding: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  searchInput: {
    backgroundColor: "#2d2e31",
    color: "#888",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  back: {
    height: 30,
    width: 30,
    tintColor: "#ACACAC",
    resizeMode: "contain",
  },
  colour: {
    justifyContent: "flex-start",
    paddingBottom: 10,
  },
  tick: {
    height: 20,
    width: 20,
    tintColor: "#ACACAC",
    resizeMode: "contain",
  },
});

export default Notes;
