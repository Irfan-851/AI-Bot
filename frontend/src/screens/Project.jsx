import { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { initializeSocket, received, send } from "../config/Socket";
import { getWebContainer } from "../config/webContainer";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { Scrollbar } from "react-scrollbars-custom";

// Custom font for chat UI
const CHAT_FONT = "'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif";

const API_BASE = "http://localhost:5000"; // Use this for all API calls

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(
    location.state && location.state.project ? location.state.project : null
  );
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = useRef();
  const messageInput = useRef(); // Add ref for input field
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [webContainer, setWebContainer] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [runProcess, setRunProcess] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Add flag to prevent multiple calls

  // Component lifecycle tracking
  useEffect(() => {
    return () => {};
  }, []);

  // Helper: fetch project details and update state
  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/projectapi/getproject/${projectId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setProject(response.data.project);
      setFileTree(response.data.project.fileTree);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
      } else {
        console.error(error);
      }
    }
  };

  const uploadFile = async (file) => {
    if (!file || !project?._id) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', project._id);
    
    try {
      const response = await axios.post(`${API_BASE}/api/fileUploadapi/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data.file;
    } catch (error) {
      console.error('File upload failed:', error);
      alert(`File upload failed: ${error.response?.data?.error || error.message}`);
      return null;
    }
  };

  // Helper: fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/userapi/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
      } else {
        console.error(error);
      }
    }
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  // Modified: Immediately append user message to local messages for instant feedback
  const sendMessageFrom = async (source = 'unknown') => {
    if (isSendingMessage) return;
    if (source === 'enter-key' && messageInput.current && document.activeElement !== messageInput.current) {
      return;
    }
    if (!user) return;
    
    setIsSendingMessage(true);
    
    // If we have a file selected, send it
    if (selectedFile) {
      await sendFileMessage(selectedFile);
      setSelectedFile(null);
      setMessage("");
      setIsSendingMessage(false);
      return;
    }
    
    // Otherwise send text message
    if (!message.trim()) {
      setIsSendingMessage(false);
      return;
    }
  
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message,
        sender: { ...user, _id: user._id?.toString?.() || user._id },
        _id: `local-${Date.now()}`,
      },
    ]);
    send("project-message", {
      message,
      sender: user,
    });
    setMessage("");
    setTimeout(() => {
      setIsSendingMessage(false);
    }, 1000);
    setTimeout(() => {
      if (messageBox.current) {
        messageBox.current.scrollTop = messageBox.current.scrollHeight;
      }
    }, 0);
  };
  
  

  // add user in project
  const addCollaborators = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/projectapi/adduserinproject`,
        {
          projectId: project && project._id,
          users: Array.from(selectedUserId),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setIsModalOpen(false);
      setSelectedUserId(new Set());
      if (project && project._id) {
        await fetchProjectDetails(project._id);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
      } else {
        console.error(error);
      }
    }
  };

  // ai message
  function WriteAiMessage(message) {
    let messageObject;
    try {
      messageObject = typeof message === "string" ? JSON.parse(message) : message;
    } catch (e) {
      messageObject = { text: String(message) };
    }
    if (!messageObject || !messageObject.text) return null;

    return (
      <div
        style={{
          background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
          color: "#fff",
          borderRadius: "18px",
          padding: "10px 18px",
          fontFamily: CHAT_FONT,
          fontSize: "1.01rem",
          fontWeight: 500,
          boxShadow: "0 2px 12px 0 rgba(79,140,255,0.10)",
          margin: "4px 0",
          maxWidth: 420,
          wordBreak: "break-word",
        }}
      >
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  useEffect(() => {
    if (!project || !project._id) return;
    initializeSocket(project._id);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
      });
    }

    received("project-message", (data) => {
      if (!data) return;
      if (data.sender && data.sender._id === "ai") {
        let messageObj;
        try {
          messageObj = typeof data.message === "string" ? JSON.parse(data.message) : data.message;
        } catch (e) {
          messageObj = { text: String(data.message) };
        }
        if (messageObj && typeof messageObj.text === "string" && messageObj.text.trim() !== "") {
          if (messageObj.fileTree) {
            webContainer?.mount(messageObj.fileTree);
            setFileTree(messageObj.fileTree || {});
          }
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages, { ...data, message: messageObj }];
            return newMessages;
          });
        }
      } else {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const isDuplicate = lastMessage && 
            lastMessage.sender?._id === data.sender?._id && 
            lastMessage.message === data.message &&
            lastMessage._id?.startsWith('local-');
          if (isDuplicate) {
            return [...prevMessages.slice(0, -1), { ...data, _id: `server-${Date.now()}` }];
          }
          return [...prevMessages, { ...data, _id: `server-${Date.now()}` }];
        });
      }
      setTimeout(() => {
        if (messageBox.current) {
          messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
      }, 0);
    });

    received('project-file', (fileData) => {
      console.log('Received project-file:', fileData); // Debug log
      const fileMessage = {
        _id: `file-${Date.now()}`,
        isFile: true,
        file: fileData.file,
        sender: fileData.sender,
        timestamp: new Date()
      };
      console.log('Created file message:', fileMessage); // Debug log
      setMessages(prev => [...prev, fileMessage]);
      setTimeout(() => {
        if (messageBox.current) {
          messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
      }, 0);
    });

    fetchAllUsers();
    fetchProjectDetails(project._id);

    return () => {};
  }, [project && project._id, webContainer]);

  useEffect(() => {
    if (!project || !project._id) {
      const storedProject = localStorage.getItem("currentProject");
      if (storedProject) {
        try {
          const parsed = JSON.parse(storedProject);
          setProject(parsed);
          setFileTree(parsed.fileTree || {});
        } catch (e) {
          if (
            location.state &&
            location.state.project &&
            location.state.project._id
          ) {
            fetchProjectDetails(location.state.project._id);
          }
        }
      } else if (
        location.state &&
        location.state.project &&
        location.state.project._id
      ) {
        fetchProjectDetails(location.state.project._id);
      }
    } else {
      localStorage.setItem("currentProject", JSON.stringify(project));
    }
  }, [project]);

  const saveFileTree = async (ft) => {
    if (
      !ft ||
      typeof ft !== "object" ||
      Object.keys(ft).length === 0
    ) {
      alert("Cannot save an empty or invalid file tree.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE}/api/projectapi/updateFile`,
        {
          projectId: project && project._id,
          fileTree: ft,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please login again.");
      } else {
        alert("An error occurred while saving the file tree.");
      }
    }
  };

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (100MB limit to match backend)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size exceeds 100MB limit');
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Set the selected file and show preview in input
    setSelectedFile(file);
    setMessage(`📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    // Reset file input but keep the file in state
    e.target.value = '';
  };

 const sendFileMessage = async (file) => {
  const fileData = await uploadFile(file);
  
  if (fileData) {
    // Create file URL for preview if it's an image
    let previewUrl = '';
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    const fileMessage = {
      _id: `file-${Date.now()}`,
      isFile: true,
      file: {
        ...fileData,
        previewUrl  // Add preview URL for images
      },
      sender: user,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, fileMessage]);
    
    // Send via Socket.IO
    send("project-file", {
      ...fileMessage,
      // Don't send preview URL to others (they'll get it from server)
      file: fileData 
    });
  }
};

  // If project is still not loaded, show a loading or error message
  if (!project || !project._id) {
    return (
      <div className="flex items-center justify-center min-h-screen w-screen bg-gradient-to-br from-blue-100 to-green-100">
        <div className="text-center">
          <div
            style={{
              fontFamily: CHAT_FONT,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#2563eb",
              marginBottom: 8,
            }}
          >
            Loading Project...
          </div>
          <div
            style={{
              color: "#64748b",
              fontFamily: CHAT_FONT,
              fontSize: "1.1rem",
            }}
          >
            Please wait or try refreshing the page.
          </div>
        </div>
      </div>
    );
  }

  // Always scroll to bottom when messages change
  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <style>
        {`
        .ai-chat-bubble {
          background: linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%);
          color: #fff;
          border-radius: 18px;
          padding: 10px 18px;
          font-family: ${CHAT_FONT};
          font-size: 1.01rem;
          font-weight: 500;
          box-shadow: 0 2px 12px 0 rgba(79,140,255,0.10);
          margin: 4px 0;
          max-width: 420px;
          word-break: break-word;
        }
        .user-chat-bubble {
          background: #fff;
          color: #222;
          border-radius: 18px;
          padding: 10px 18px;
          font-family: ${CHAT_FONT};
          font-size: 1.01rem;
          font-weight: 500;
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
          margin: 4px 0;
          max-width: 340px;
          word-break: break-word;
        }
        .chat-meta {
          font-size: 0.82rem;
          color: #64748b;
          font-family: ${CHAT_FONT};
          font-weight: 400;
          margin-bottom: 2px;
        }
        .chat-container {
          background: linear-gradient(120deg, #e0e7ff 0%, #d1fae5 100%);
          border-radius: 24px;
          box-shadow: 0 4px 32px 0 rgba(79,140,255,0.08);
          padding: 0;
          margin: 0;
          font-family: ${CHAT_FONT};
        }
        .chat-input-bar {
          background: #f1f5f9;
          border-radius: 16px;
          box-shadow: 0 2px 8px 0 rgba(79,140,255,0.06);
          font-family: ${CHAT_FONT};
        }
        .chat-input {
          font-family: ${CHAT_FONT};
          font-size: 1.08rem;
          border-radius: 10px;
          border: none;
          outline: none;
          padding: 14px 18px;
          background: #fff;
          color: #222;
          width: 100%;
        }
        .chat-send-btn {
          background: linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 1.2rem;
          font-weight: 600;
          margin-left: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-send-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
        }
        .chat-gallery-btn {
          background: #e0e7ff;
          color: #2563eb;
          border: none;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 1.2rem;
          margin-left: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chat-gallery-btn:hover {
          background: #c7d2fe;
        }
        .chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: #bae6fd;
          border-radius: 8px;
        }
        `}
      </style>
      <div
        className="w-screen flex overflow-hidden"
        style={{
          fontFamily: CHAT_FONT,
          minHeight: "100vh",
          height: "100vh",
          maxHeight: "100vh",
        }}
      >
        {/* left side panel */}
        <div
          className="left relative flex flex-col"
          style={{
            background: "linear-gradient(120deg, #e0e7ff 0%, #d1fae5 100%)",
            borderRadius: "18px",
            boxShadow: "0 4px 32px 0 rgba(79,140,255,0.08)",
            margin: "12px 6px 12px 12px",
            overflow: "hidden",
            minWidth: 500,
            maxWidth: 600,
            height: "calc(100vh - 24px)",
            flex: "0 0 370px",
            display: "flex",
          }}
        >
          <header
            style={{
              background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
              color: "#fff",
              fontFamily: CHAT_FONT,
              fontWeight: 600,
              fontSize: "1.01rem",
              borderRadius: "12px",
              padding: "7px 14px",
              margin: "12px 12px 0 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
              position: "relative",
              boxShadow: "0 2px 12px 0 rgba(79,140,255,0.10)",
            }}
          >
            <button
              style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.95rem",
                border: "none",
                cursor: "pointer",
                gap: 4,
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <i className="ri-add-fill mr-1"></i>
              <span>Add</span>
            </button>
            <button
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "1.1rem",
                cursor: "pointer",
              }}
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-group-fill"></i>
            </button>
          </header>
          {/* message area */}
          <div
            className="conversation-area flex-grow flex flex-col relative"
            style={{
              marginTop: 18,
              padding: "0 18px 0 18px",
              paddingBottom: 0,
              minHeight: 0,
              position: "relative",
              height: "100%",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              ref={messageBox}
              className="message-box flex-grow flex flex-col gap-2 overflow-y-auto chat-scrollbar"
              style={{
                padding: "8px 0 0 0",
                minHeight: 0,
                marginBottom: 0,
                height: "calc(100% - 80px)",
                maxHeight: "calc(100% - 80px)",
              }}
            >
              {messages.map((msg, index) => {
                const key =
                  msg._id ||
                  (msg.sender && msg.sender._id && msg.message
                    ? `${msg.sender._id}-${typeof msg.message === "object" ? msg.message.text : msg.message}-${index}`
                    : `msg-${index}`);
                const isAI = msg.sender?._id === "ai";
                const isUser = msg.sender?._id === user?._id?.toString();
                
                // Handle file messages
                if (msg.isFile) {
                  return (
                    <div key={msg._id} style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      marginBottom: 6
                    }}>
                      <span className="chat-meta" style={{ 
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        marginBottom: 2,
                        fontWeight: 500,
                        color: '#64748b'
                      }}>
                        {msg.sender?.email}
                      </span>
                      <div className="file-message" style={{
                        background: '#fff',
                        borderRadius: '18px',
                        padding: '12px',
                        maxWidth: '340px',
                        wordBreak: 'break-word'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <i className="ri-file-fill" style={{ fontSize: '24px', marginRight: '8px' }}></i>
                          <div>
                            <div style={{ fontWeight: 500 }}>{msg.file.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {(msg.file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview for images */}
                        {msg.file.type.startsWith('image/') && (
                          <img 
                            src={msg.file.previewUrl || 
               (msg.file.url.startsWith('http') ? msg.file : `${API_BASE}${msg.file}`)}  
                            alt={msg.file.name} 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px',
                              borderRadius: '8px',
                              marginTop: '8px'
                            }}
                            onLoad={() => {
            // Revoke object URL after image loads
            if (msg.file.previewUrl) {
              URL.revokeObjectURL(msg.file.previewUrl);
            }
          }}
                          />
                        )}
                        
                        <a 
                          href={msg.file.url.startsWith('http') ? msg.file.url : `${API_BASE}${msg.file.url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            background: '#4f8cff',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            marginTop: '8px',
                            fontSize: '0.9rem'
                          }}
                        >
                         <i class="ri-arrow-down-circle-fill"></i>
                        </a>
                      </div>
                    </div>
                  );
                }
                
                // Handle regular messages
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAI ? "flex-start" : isUser ? "flex-end" : "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <span className="chat-meta" style={{
                      alignSelf: isAI ? "flex-start" : isUser ? "flex-end" : "flex-start",
                      marginBottom: 2,
                      fontWeight: 500,
                      color: isAI ? "#4f8cff" : "#64748b",
                    }}>
                      {isAI ? "AI" : msg.sender?.email}
                    </span>
                    <div
                      className={isAI ? "ai-chat-bubble" : "user-chat-bubble"}
                      style={{
                        alignSelf: isAI ? "flex-start" : isUser ? "flex-end" : "flex-start",
                        background: isAI
                          ? "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)"
                          : "#fff",
                        color: isAI ? "#fff" : "#222",
                        fontWeight: 500,
                        fontSize: "1.01rem",
                        borderTopLeftRadius: isAI ? 0 : 14,
                        borderTopRightRadius: isAI ? 14 : 0,
                        borderBottomLeftRadius: 14,
                        borderBottomRightRadius: 14,
                        boxShadow: isAI
                          ? "0 2px 12px 0 rgba(79,140,255,0.10)"
                          : "0 2px 12px 0 rgba(0,0,0,0.06)",
                        marginLeft: isAI ? 0 : "auto",
                        marginRight: isUser ? 0 : "auto",
                        maxWidth: isAI ? 420 : 340,
                        minWidth: 0,
                        wordBreak: "break-word",
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                    >
                      {isAI && msg.message && msg.message.text
                        ? (
                          <span style={{ whiteSpace: "pre-wrap" }}>
                            {msg.message.text}
                          </span>
                        )
                        : (
                          <span style={{ whiteSpace: "pre-wrap" }}>
                            {typeof msg.message === "object" ? msg.message.text : msg.message}
                          </span>
                        )}
                    </div>
                  </div>
                );
              })}
              {/* Always keep a dummy div at the bottom for scroll-to-bottom */}
              <div ref={el => {
                if (el && messageBox.current) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }} />
            </div>
            <div
              className="input-area w-full flex items-center chat-input-bar"
              style={{
                padding: "16px 18px",
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: "0 0 18px 18px",
                background: "#f1f5f9",
                boxShadow: "0 -2px 12px 0 rgba(79,140,255,0.04)",
                zIndex: 2,
                minWidth: 0,
              }}
            >
              <input
                ref={messageInput}
                type="text"
                required
                onChange={(e) => {
                  // Don't allow editing if file is selected
                  if (!selectedFile) {
                    setMessage(e.target.value);
                  }
                }}
                value={message}
                aria-describedby="helper-text-explanation"
                className="chat-input"
                placeholder={selectedFile ? "File selected - click send or clear" : "Type your message..."}
                style={{
                  fontFamily: CHAT_FONT,
                  fontSize: "1.08rem",
                  borderRadius: 10,
                  border: "none",
                  outline: "none",
                  padding: "14px 18px",
                  background: selectedFile ? "#f0f9ff" : "#fff",
                  color: "#222",
                  width: "100%",
                  boxShadow: "0 1px 4px 0 rgba(79,140,255,0.04)",
                  
                }}
                readOnly={selectedFile ? true : false}
                onKeyDown={e => {
                  if (e.target !== messageInput.current) {
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    sendMessageFrom('enter-key');
                  }
                }}
              />
              {/* Clear file button */}
              {selectedFile && (
                <button
                  className="chat-clear-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setMessage("");
                  }}
                  title="Clear file selection"
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginLeft: "8px"
                  }}
                >
                  <i className="ri-close-line"></i>
                </button>
              )}
              {/* Gallery Icon */}
              <button
                className="chat-gallery-btn"
                onClick={() => document.getElementById("fileInput").click()}
                title="Attach file"
              >
                <i className="ri-gallery-line"></i>
              </button>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*"
              />
              <button
                className="chat-send-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendMessageFrom('send-button');
                }}
                title="Send"
              >
                <i className="ri-send-plane-fill"></i>
              </button>
            </div>
          </div>
          {/* side panel */}
          <div
            className={`sidePanel w-80 h-full flex rounded-lg flex-col gap-2 bg-green-200 absolute transition-all ${
              isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
            } top-0`}
            style={{
              background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
              color: "#fff",
              zIndex: 30,
              boxShadow: "0 2px 12px 0 rgba(79,140,255,0.10)",
              fontFamily: CHAT_FONT,
              minWidth: 320,
              maxWidth: 420,
              height: "100%",
              top: 0,
              left: 0,
            }}
          >
            <header className="flex justify-between items-center rounded-lg px-4 p-1" style={{ background: "rgba(255,255,255,0.10)" }}>
              <h1 className="font-semibold text-lg" style={{ color: "#fff" }}>Collaborators</h1>
              <button
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className="p-2 text-2xl"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div
              className="users flex flex-col gap-2 p-2 overflow-auto"
              style={{
                maxHeight: "calc(100vh - 80px)",
                fontFamily: CHAT_FONT,
              }}
            >
              {project.users &&
                project.users.map((user) => {
                  return (
                    <div
                      key={user._id}
                      className="user cursor-pointer hover:bg-white hover:rounded-full p-2 flex gap-2 items-center"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: 12,
                        marginBottom: 4,
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "1.05rem",
                        transition: "background 0.2s",
                      }}
                    >
                      <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-green-600">
                        <i className="ri-user-fill absolute"></i>
                      </div>
                      <h1 className="font-semibold text-lg text-white">
                        {user.email}
                      </h1>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* right side panel */}
        <div className="right bg-green-50 flex-grow h-full flex rounded-xl" style={{ minHeight: "100vh", height: "100vh", maxHeight: "100vh" }}>
          <div className="explorer h-full max-w-64 min-w-52 bg-green-100 overflow-y-hidden">
            <div className="file-tree w-full text-center">
              {Object.keys(fileTree || {}).map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles([...new Set([...openFiles, file])]);
                  }}
                  className="tree-element rounded-lg cursor-pointer mb-2 p-2 px-4 flex items-center gap-2 bg-green-300 w-full"
                  style={{
                    fontFamily: CHAT_FONT,
                    fontWeight: 600,
                    fontSize: "1.08rem",
                    color: "#2563eb",
                    background: "#dbeafe",
                    border: "none",
                    marginBottom: 8,
                  }}
                >
                  <p>{file}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="code-editor flex flex-col flex-grow h-full">
            <div className="top flex justify-between w-full">
              <Scrollbar style={{ height: "60px", overflow: "hidden" }}>
                <div className="files flex">
                  {openFiles.map((file) => (
                    <button
                      key={file}
                      onClick={() => setCurrentFile(file)}
                      className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 ${
                        currentFile === file ? "bg-green-500" : ""
                      }`}
                      style={{
                        fontFamily: CHAT_FONT,
                        fontWeight: 600,
                        fontSize: "1.08rem",
                        color: currentFile === file ? "#fff" : "#2563eb",
                        background: currentFile === file ? "#4f8cff" : "#e0e7ff",
                        border: "none",
                        borderRadius: 10,
                        marginRight: 8,
                        marginBottom: 4,
                        transition: "background 0.2s",
                      }}
                    >
                      <p>{file}</p>
                      <button style={{
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        fontSize: "1.2rem",
                        marginLeft: 4,
                        cursor: "pointer",
                      }}>
                        <i className="ri-close-fill mt-1" />
                      </button>
                    </button>
                  ))}
                </div>
              </Scrollbar>
              <div className="actions flex gap-2">
                <button
                  onClick={async () => {
                    await webContainer.mount(fileTree);
                    const installProcess = await webContainer.spawn("npm", [
                      "install",
                    ]);
                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );
                    if (runProcess) {
                      runProcess.kill();
                    }
                    let tempRunProcess = await webContainer.spawn("npm", [
                      "start",
                    ]);
                    tempRunProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );
                    setRunProcess(tempRunProcess);
                    webContainer.on("server-ready", (port, url) => {
                      setIframeUrl(url);
                    });
                  }}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: "1.08rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px 0 rgba(79,140,255,0.08)",
                  }}
                >
                  Run
                </button>
              </div>
            </div>
            <div className="bottom flex flex-grow h-full max-w-full shrink overflow-y-hidden">
              {fileTree?.[currentFile]?.file?.contents ? (
                <div className="code-editor-area h-full flex-grow bg-green-50">
                  <pre className="hljs h-full" style={{
                    background: "#0f172a",
                    color: "#f1f5f9",
                    borderRadius: 12,
                    padding: "18px",
                    fontFamily: "Fira Mono, Menlo, Monaco, 'Courier New', monospace",
                    fontSize: "1.01rem",
                    minHeight: "100%",
                  }}>
                    <code
                      className="hljs h-full outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        const ft = {
                          ...fileTree,
                          [currentFile]: {
                            ...fileTree[currentFile],
                            file: {
                              contents: updatedContent,
                            },
                          },
                        };
                        setFileTree(ft);
                        saveFileTree(ft);
                      }}
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlight(
                          "javascript",
                          fileTree[currentFile]?.file?.contents || ""
                        ).value,
                      }}
                      style={{
                        whiteSpace: "pre-wrap",
                        paddingBottom: "25rem",
                        counterSet: "line-numbering",
                        outline: "none",
                        minHeight: "100%",
                        background: "transparent",
                        color: "#f1f5f9",
                      }}
                    />
                  </pre>
                </div>
              ) : (
                <p
                  className="text-center my-48 mx-52 text-gray-500"
                  style={{
                    fontFamily: CHAT_FONT,
                    fontSize: "1.1rem",
                    color: "#64748b",
                    margin: "auto",
                  }}
                >
                  No file selected or content available
                </p>
              )}
            </div>
          </div>
          {iframeUrl && webContainer && (
            <div className="flex min-w-96 flex-col h-full">
              <div className="address-bar">
                <input
                  type="text"
                  onChange={(e) => setIframeUrl(e.target.value)}
                  value={iframeUrl}
                  className="w-full p-2 px-4 bg-slate-200"
                  style={{
                    fontFamily: CHAT_FONT,
                    fontSize: "1.05rem",
                    borderRadius: 10,
                    border: "none",
                    outline: "none",
                    marginBottom: 0,
                  }}
                />
              </div>
              <iframe src={iframeUrl} className="w-full h-full" style={{
                border: "none",
                borderRadius: 10,
                marginTop: 0,
                minHeight: 0,
              }}></iframe>
            </div>
          )}
        </div>

        {/* modal for adding collaborators */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 100 }}>
            <div
              className="bg-white p-4 rounded-md w-96 max-w-full relative"
              style={{
                fontFamily: CHAT_FONT,
                background: "linear-gradient(120deg, #e0e7ff 0%, #d1fae5 100%)",
                borderRadius: 18,
                boxShadow: "0 4px 32px 0 rgba(79,140,255,0.12)",
                padding: "32px 28px 24px 28px",
                minWidth: 340,
                maxWidth: 420,
              }}
            >
              <header className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: CHAT_FONT,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#2563eb",
                  }}
                >
                  Select User
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2"
                  style={{
                    background: "rgba(79,140,255,0.10)",
                    color: "#2563eb",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  <i className="ri-close-fill"></i>
                </button>
              </header>
              <div
                className="bg-white flex px-4 w-48 border-b border-[#333] focus-within:border-500 overflow-hidden max-w-sm mx-auto font-[sans-serif]"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: 10,
                  border: "1px solid #dbeafe",
                  marginBottom: 18,
                  alignItems: "center",
                  padding: "8px 12px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 192.904 192.904"
                  width="18px"
                  className="fill-gray-600 mr-3"
                >
                  <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none text-sm"
                  style={{
                    fontFamily: CHAT_FONT,
                    fontSize: "1.05rem",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "#222",
                  }}
                />
              </div>
              <div
                className="users-list flex flex-col gap-2 mb-16 max-h-72 overflow-auto"
                style={{
                  fontFamily: CHAT_FONT,
                  maxHeight: 260,
                  overflowY: "auto",
                  marginBottom: 32,
                }}
              >
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`user cursor-pointer hover:bg-green-200 rounded-full p-2 flex gap-2 items-center ${
                      Array.from(selectedUserId).indexOf(user._id) !== -1
                        ? "bg-green-200"
                        : ""
                    }`}
                    onClick={() => handleUserClick(user._id)}
                    style={{
                      background:
                        Array.from(selectedUserId).indexOf(user._id) !== -1
                          ? "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)"
                          : "rgba(255,255,255,0.85)",
                      color:
                        Array.from(selectedUserId).indexOf(user._id) !== -1
                          ? "#fff"
                          : "#222",
                      borderRadius: 12,
                      fontWeight: 500,
                      fontSize: "1.05rem",
                      marginBottom: 4,
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s",
                    }}
                  >
                    <div
                      className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-green-600"
                      style={{
                        background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 10,
                        fontSize: "1.2rem",
                      }}
                    >
                      <i className="ri-user-fill"></i>
                    </div>
                    <h1 className="font-semibold text-lg" style={{ fontFamily: CHAT_FONT }}>
                      {user.email}
                    </h1>
                  </div>
                ))}
              </div>
              <button
                onClick={addCollaborators}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-md"
                style={{
                  background: "linear-gradient(135deg, #4f8cff 0%, #6ee7b7 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.08rem",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 28px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bottom: 18,
                  position: "absolute",
                  boxShadow: "0 2px 8px 0 rgba(79,140,255,0.08)",
                  cursor: "pointer",
                }}
              >
                Add Collaborators
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Project;
