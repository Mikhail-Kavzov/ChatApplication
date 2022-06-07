package com.example.chat.modelClasses;

public class ChatMessage {
    private MessageType type;
    private String content;
    private String sender;
    private String timestamp;

    private String addresschat;

    private String uid;

    public String getAddresschat() {
        return addresschat;
    }

    public void setAddresschat(String addresschat) {
        this.addresschat = addresschat;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public enum MessageType {
        CHAT,
        FILE,
        AUTO,
        JOINCHAT,
        JOIN,
        LEAVE
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getTimestamp() {
        return timestamp;
    }
}
