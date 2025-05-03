import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from '../components/AnimatedButton';
import { db, auth } from '../firebaseConfig';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid'; // for generating unique IDs

export default function TaskListScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchTasks = () => {
    const userId = auth.currentUser.uid;
    const tasksRef = ref(db, `tasks/${userId}`);
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTasks(taskArray);
      } else {
        setTasks([]);
      }
    });
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const userId = auth.currentUser.uid;
            await remove(ref(db, `tasks/${userId}/${taskId}`));
          } catch (error) {
            Alert.alert('Error', 'Could not delete task.');
          }
        }
      },
    ]);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
    setModalVisible(true);
  };

  const saveEditedTask = async () => {
    try {
      const userId = auth.currentUser.uid;
      await update(ref(db, `tasks/${userId}/${editingTask.id}`), {
        title: editedTitle,
      });
      setModalVisible(false);
      setEditingTask(null);
      setEditedTitle('');
    } catch (error) {
      Alert.alert('Error', 'Could not update task.');
    }
  };

  const toggleCompleteTask = async (taskId, completed) => {
    try {
      const userId = auth.currentUser.uid;
      await update(ref(db, `tasks/${userId}/${taskId}`), {
        completed: !completed,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not update task status.');
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity onPress={() => toggleCompleteTask(item.id, item.completed)}>
        <Text style={[styles.taskText, item.completed && styles.completed]}>
          {item.title} [{item.category}]
        </Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => handleEditTask(item)} style={styles.actionButton}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={styles.actionButtonDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0b0c10', '#1f2833']} style={styles.container}>
      <Text style={styles.title}>Your Task List</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <AnimatedButton title="Add New Task" onPress={() => navigation.navigate('AddTask')} />
      <AnimatedButton title="Back to Home" onPress={() => navigation.navigate('Home')} />

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Edit task title"
              placeholderTextColor="#c5c6c7"
            />
            <AnimatedButton title="Save Changes" onPress={saveEditedTask} />
            <AnimatedButton title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, color: '#66fcf1', marginBottom: 20, textAlign: 'center' },
  taskItem: { backgroundColor: '#1f2833', padding: 15, marginBottom: 10, borderRadius: 10 },
  taskText: { color: '#c5c6c7', fontSize: 18 },
  completed: { textDecorationLine: 'line-through', color: '#45a29e' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionButton: { backgroundColor: '#45a29e', padding: 8, borderRadius: 8, marginLeft: 10 },
  actionButtonDelete: { backgroundColor: '#ff2e63', padding: 8, borderRadius: 8, marginLeft: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '80%', backgroundColor: '#0b0c10', padding: 20, borderRadius: 10 },
  modalTitle: { color: '#66fcf1', fontSize: 24, marginBottom: 15, textAlign: 'center' },
  input: { width: '100%', padding: 15, borderColor: '#45a29e', borderWidth: 1, borderRadius: 10, marginBottom: 20, color: '#ffffff' },
});
