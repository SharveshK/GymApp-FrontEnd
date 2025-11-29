import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TextInput, FlatList, 
  TouchableOpacity, KeyboardAvoidingView, Platform, 
  Keyboard, StatusBar, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

// --- TYPES ---
interface ChatResponse {
  messageId: number;
  userId: number;
  sender: 'USER' | 'AI';
  messageText: string;
  createdAt: string;
}

interface UIMessage {
  id: string;
  text: string;
  sender: 'USER' | 'AI';
  timestamp: Date;
}

// --- PULSING INDICATOR (Unchanged) ---
const TypingIndicator = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.typingContainer}>
       <View style={styles.avatarAiSmall}>
          <Ionicons name="sparkles" size={10} color="#000" />
       </View>
       <View style={styles.typingBubble}>
         <Animated.View style={{ opacity: fadeAnim, flexDirection: 'row' }}>
            <View style={styles.dot} />
            <View style={[styles.dot, { marginHorizontal: 3 }]} />
            <View style={styles.dot} />
         </Animated.View>
       </View>
    </View>
  );
};

// --- MAIN SCREEN ---
const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get<ChatResponse[]>('/api/v1/chat');
      const history: UIMessage[] = response.data.map(msg => ({
        id: msg.messageId.toString(),
        text: msg.messageText,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt)
      }));

      if (history.length === 0) {
        setMessages([{
          id: 'welcome',
          text: "I am The Oracle. I have analyzed your biometrics. How can I assist with your protocol today?",
          sender: 'AI',
          timestamp: new Date()
        }]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    const tempId = Date.now().toString();

    const userMsg: UIMessage = {
      id: tempId,
      text: userText,
      sender: 'USER',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.post<ChatResponse>('/api/v1/chat', { 
        messageText: userText 
      });
      
      const aiData = response.data;
      const aiMsg: UIMessage = {
        id: aiData.messageId.toString(),
        text: aiData.messageText,
        sender: 'AI',
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      const errorMsg: UIMessage = {
        id: Date.now().toString(),
        text: "Connection to Oracle severed. Please try again.",
        sender: 'AI',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: UIMessage }) => {
    const isAi = item.sender === 'AI';
    const timeString = item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.messageRow, isAi ? styles.rowLeft : styles.rowRight]}>
        
        {/* AI AVATAR: Clean & Sharp */}
        {isAi && (
            <View style={styles.avatarAi}>
                <Ionicons name="sparkles" size={12} color="#000" />
            </View>
        )}

        <View style={{ maxWidth: '85%' }}> 
            <View style={[styles.bubble, isAi ? styles.bubbleAi : styles.bubbleUser]}>
                <Text style={[styles.messageText, isAi ? styles.textAi : styles.textUser]}>
                    {item.text}
                </Text>
            </View>
            <Text style={[styles.timestamp, isAi ? styles.timeLeft : styles.timeRight]}>
                {timeString}
            </Text>
        </View>

        {/* USER AVATAR: Subtler */}
        {!isAi && (
            <View style={styles.avatarUser}>
                <Ionicons name="person" size={10} color="rgba(255,255,255,0.7)" />
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* HEADER: Subtler System Status Bar */}
      <View style={styles.systemHeader}>
        <View style={styles.statusDot} />
        <Text style={styles.systemText}>AI NEURAL NET ACTIVE</Text>
      </View>
      <View style={styles.divider} />

      <LinearGradient 
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0)']} 
        style={styles.topGradient} 
        pointerEvents="none"
      />

      {/* Manual Padding Logic for Keyboard */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "padding"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0} 
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        {/* INPUT BAR: Floated & Shadowed */}
        <View style={styles.inputWrapper}>
            <View style={styles.glassInput}>
                <TextInput
                    style={styles.input}
                    placeholder="Query the Oracle..."
                    placeholderTextColor="#777" 
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity 
                    style={styles.sendButton} 
                    onPress={sendMessage}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-up" size={18} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  // HEADER SYSTEM BAR
  systemHeader: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 8, 
    paddingBottom: 12, 
    backgroundColor: '#000', zIndex: 20 
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#03DAC6', marginRight: 6 },
  systemText: { color: '#03DAC6', fontSize: 10, fontWeight: '700', letterSpacing: 2, opacity: 0.8 },
  
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', width: '100%' },
  topGradient: { position: 'absolute', top: 40, left: 0, right: 0, height: 20, zIndex: 10 },
  
  listContent: { paddingHorizontal: 20, paddingVertical: 20 },

  // ROWS
  messageRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  // AVATARS
  avatarAi: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EAEAEA', justifyContent: 'center', alignItems: 'center',
    marginRight: 10, marginBottom: 20, 
    shadowColor: "#FFF", shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.2, shadowRadius: 4
  },
  avatarUser: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
    marginLeft: 8, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },

  // BUBBLES
  bubble: { padding: 16, borderRadius: 22, minHeight: 40 },
  bubbleAi: {
    backgroundColor: '#161616', 
    borderTopLeftRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  bubbleUser: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomRightRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)'
  },

  // TYPOGRAPHY
  messageText: { fontSize: 14, lineHeight: 24 }, // Increased line-height
  textAi: { color: '#CCC' }, 
  textUser: { color: '#FFF', fontWeight: '500' },

  // TIMESTAMP
  timestamp: { fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4, fontWeight: '600' },
  timeLeft: { alignSelf: 'flex-start', marginLeft: 4 },
  timeRight: { alignSelf: 'flex-end', marginRight: 4 },

  // TYPING
  typingContainer: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 0, marginBottom: 20 },
  avatarAiSmall: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#444', justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginBottom: 2
  },
  typingBubble: {
    backgroundColor: '#161616', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 18, borderTopLeftRadius: 4,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#03DAC6' },

  // INPUT BAR
  inputWrapper: {
    padding: 15,
    backgroundColor: '#000',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    // Floating Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  glassInput: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#111', 
    borderRadius: 30, 
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  input: {
    flex: 1,
    color: '#FFF', fontSize: 14,
    marginLeft: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#03DAC6', 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#03DAC6", shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5
  },
});

export default ChatScreen;