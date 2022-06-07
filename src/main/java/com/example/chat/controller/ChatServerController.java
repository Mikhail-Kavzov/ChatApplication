package com.example.chat.controller;

import com.example.chat.modelClasses.*;
import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Controller
public class ChatServerController {
    final static String usersTable="usersinfo";
    private final String mainChatName="TelegRun";
    private final String chatListTable="chatlist";
    private final String chtUl="-cht";
    private static final Logger logger = LoggerFactory.getLogger(SocketEvent.class);
    private final Gson gson  = new Gson();
    private static final int countMessages=10;
    private final int n=784278;
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage message) {

        messagingTemplate.convertAndSend("/chat/messaging/"+message.getAddresschat(),message);
        String address=message.getAddresschat();
        address=address.substring(0,address.length()-chtUl.length());
        ChatMessage.MessageType type =message.getType();
        if (type == ChatMessage.MessageType.CHAT || type == ChatMessage.MessageType.FILE)
        MySqlConnector.QueryNonSelect("INSERT INTO "+address+"messages (message) VALUE ('"+gson.toJson(message)+"')");

    }
    @MessageMapping("/chat.getSmiles")
    @SendTo("/chat/responseSmiles")
    public String getSmiles() throws SQLException {
        ResultSet res=MySqlConnector.QuerySelect("SELECT content FROM smiles");

        List<String>smileContent= new ArrayList<>();
        while (res.next())
        {
            smileContent.add(res.getString("content"));
        }
        return gson.toJson(smileContent);
    }
    @MessageMapping("/chat.joinChat")
    @SendTo("/chat/responseChat")
    public String checkChatJoinData(@Payload ChatForm chatForm) throws SQLException {

        String chatName=chatForm.getName();
        ResultSet res=MySqlConnector.QuerySelect("SELECT * FROM "+chatListTable+" WHERE name = \""+chatName+'\"');
        if (!res.first())
            return "{\"str\":\"Такого чата не существует\"}";
        String hash= CryptoKey.getKeyCode(chatForm.getPassword(),n);
        String DBPassword=res.getString("password");
        if (!hash.equals(DBPassword))
            return "{\"str\":\"Неверный пароль\"}";
        String  uList=res.getString("connectedUsers");
        String[] userMas=uList.split(",");

        String userId=chatForm.getUserid();
            for (String val: userMas)
            {
                if (val.equals(userId))
                    return "{\"str\":\"Вы уже подключены к чату\"}";
            }
        String nameUser=chatForm.getNickname();
            MySqlConnector.QueryNonSelect("UPDATE " + usersTable + " SET chatList = CONCAT(chatList,\","+chatName+"\") WHERE id = "+userId+"");
            MySqlConnector.QueryNonSelect("UPDATE " + chatListTable + " SET connectedUsers = CONCAT(connectedUsers,\","+userId+"\") WHERE name = \""+chatName+"\"");

        uList+=","+userId;
        uList=getUserListById(uList);
        ChatMessage message = new ChatMessage();
        String content="{\"chatname\":\""+chatName+"\",\"user\":\""+nameUser+"\"}";
        message.setType(ChatMessage.MessageType.JOINCHAT);
        message.setContent(content);
        message.setUid(userId);
        messagingTemplate.convertAndSend("/chat/messaging/"+chatName+chtUl,message);
        Runnable task = getNewThreadMessage(chatName,Integer.parseInt(userId));
        Thread thread = new Thread(task);
        thread.start();
        return "{\"str\":\"Good\",\"chatname\":\""+chatName+"\",\"userlist\":\""+uList+"\"}";
    }
    public String getMessagesFromTable(int start, int end, String table) throws Exception {
        String result = "";

            ResultSet res = MySqlConnector.QuerySelect("SELECT message FROM " + table + "messages WHERE id BETWEEN " + start + " AND " + end);

            while (res.next()) {
                result += res.getString("message") + ",";
            }
            if (!result.equals(""))
            result=result.substring(0,result.length()-1);
            return result;

    }
    public void requestForMessages(int maxValue,String chat, int uid) throws Exception {
        int startValue=maxValue-countMessages+1;
        if (startValue<=0)
            startValue=1;
        ChatMessageInform msgInf= new ChatMessageInform(startValue-1,chat+chtUl,uid);
        String result="[";
        result+=gson.toJson(msgInf)+",";
        result+=getMessagesFromTable(startValue,maxValue,chat);
        result+="]";
        messagingTemplate.convertAndSend("/chat/messaging/"+uid,result);
    }
    @MessageMapping("/chat.getMessagesForChat")
    public void getNewMessages(@Payload ChatMessageInform chatMessageInform) throws Exception {
        int maxValue=chatMessageInform.getMessageid();
        String chatName=chatMessageInform.getChtname();
        chatName=chatName.substring(0,chatName.length()-chtUl.length());
        int uid=chatMessageInform.getUid();
        requestForMessages(maxValue,chatName,uid);
    }
    public void defineMaxTableMessage(String[] chatList,int uid) throws Exception {

        for (String chat:chatList)
        {
            ResultSet res=MySqlConnector.QuerySelect("SELECT MAX(id) AS \"id\" FROM "+chat+"messages");
            res.first();
            int maxValue=res.getInt("id");
            Thread.sleep(80);
            requestForMessages(maxValue,chat,uid);
        }

    }
    @MessageMapping("/chat.addPrivate")
    @SendTo("/chat/checkPrivateChat")
    public String chatPrivate(@Payload ChatForm chatForm) throws SQLException {

        String[] chatName=chatForm.getName().split(",");
        String password=chatForm.getPassword();
        String[] nameUsers=chatForm.getNickname().split("_");
        String userId=chatForm.getUserid();
        String connectedUsers=nameUsers[0]+','+nameUsers[1];
        String chatPrev=chatName[1].substring(0,chatName[1].length()-chtUl.length());
        ResultSet res=MySqlConnector.QuerySelect("SELECT connectedUsers FROM "+chatListTable+" WHERE name = \""+chatPrev+'\"');
        res.first();
        String usersConnectedPrev=res.getString("connectedUsers");
        int[] userConnectedMas = Arrays.stream(usersConnectedPrev.split(",")).mapToInt(Integer::parseInt).toArray();
        Arrays.sort(userConnectedMas);
        int position=Integer.parseInt(chatName[2]);
        int idUserClick=userConnectedMas[position];
        if (userId.equals(Integer.toString(idUserClick)))
            return "{\"str\":\"нельзя подключиться к самому себе\"}";
        res=MySqlConnector.QuerySelect("SELECT name FROM "+chatListTable+" WHERE (connectedUsers = \""+userId+","+idUserClick+"\" OR connectedUsers = \""+idUserClick+","+userId+"\")  AND password = \"\"");
        if (res.first()) {
            String chtName=res.getString("name");
            return "{\"str\":\"good\",\"state\":\"click\",\"chatname\":\"" +chtName+"\"}";
        }
        MySqlConnector.QueryNonSelect("INSERT INTO " + chatListTable + " (name,password,connectedUsers) VALUES (\"" +
                chatName[0] + "\",\"" +
                password + "\",\""
                +userId+","+idUserClick+"\")");
       res=MySqlConnector.QuerySelect("SELECT id FROM "+chatListTable+" WHERE name = \""+chatName[0]+'\"');
       res.first();
       int chatId=res.getInt("id");
        MySqlConnector.QueryNonSelect("UPDATE " + chatListTable + " SET name = CONCAT(name,\"_"+chatId+"\") WHERE id = "+chatId);
        chatName[0]+="_"+chatId;
        MySqlConnector.QueryNonSelect("UPDATE " + usersTable + " SET chatList = CONCAT(chatList,\","+chatName[0]+"\") WHERE id IN ("+userId+", "+idUserClick+")");
        MySqlConnector.QueryNonSelect("CREATE TABLE " + chatName[0] + "Messages (id INT NOT NULL AUTO_INCREMENT,Message LONGTEXT,PRIMARY KEY (id))");

        ChatMessage message = new ChatMessage();
        message.setAddresschat(chatName[1]);
        message.setType(ChatMessage.MessageType.AUTO);
        message.setUid(Integer.toString(idUserClick));
        message.setSender(nameUsers[1]);
        String content="{\"chatname\":\""+chatName[0]+"\",\"chatreal\":\""+nameUsers[0]+"\",\"userlist\":\""+connectedUsers+"\",\"user\":\""+nameUsers[1]+"\"}";
        message.setContent(content);
        messagingTemplate.convertAndSend("/chat/messaging/"+chatName[1],message);
        return "{\"str\":\"good\",\"state\":\"join\",\"chatreal\":\""+nameUsers[1]+"\",\"chatname\":\""+chatName[0]+"\",\"userlist\":\""+connectedUsers+"\"}";
    }

    @MessageMapping("/chat.createChat")
    @SendTo("/chat/responseRegChat")
    public String checkChatRegData(@Payload ChatForm chatForm) throws SQLException {

        String chatName=chatForm.getName();
        ResultSet res=MySqlConnector.QuerySelect("SELECT * FROM "+chatListTable+" WHERE name = \""+chatName+'\"');
        if (res.first())
            return "{\"str\":\"Такой чат уже существует\"}";

        String password=chatForm.getPassword();
        String nameUser=chatForm.getNickname();
        String userId=chatForm.getUserid();
        String hash= CryptoKey.getKeyCode(password,n);
        MySqlConnector.QueryNonSelect("INSERT INTO " + chatListTable + " (name,password,connectedUsers) VALUES (\"" +
                    chatName + "\",\"" +
                    hash + "\","
                    +userId+")");
        MySqlConnector.QueryNonSelect("CREATE TABLE " + chatName + "Messages (id INT NOT NULL AUTO_INCREMENT,Message LONGTEXT,PRIMARY KEY (id))");
        MySqlConnector.QueryNonSelect("UPDATE " + usersTable + " SET chatList = CONCAT(chatList,\","+chatName+"\") WHERE id = "+userId);
        return "{\"str\":\"Good\",\"chatname\":\""+chatName+"\",\"userlist\":\""+nameUser+"\"}";


    }




    @MessageMapping("/chat.requestUserRegData")
    @SendTo("/chat/responseUserData")
    public String checkUserRegData(@Payload AutorizeForm userForm) throws SQLException {


        String email=userForm.getUemail();
        ResultSet res=MySqlConnector.QuerySelect("SELECT email FROM "+usersTable+" WHERE email = \""+email+'\"');
        if (res.first())
            return "{\"str\":\"Пользователь с таким электронным адресом уже существует\"}";
        String name= userForm.getUnickname();
        String hash= CryptoKey.getKeyCode(userForm.getUpassword(),n);
        MySqlConnector.QueryNonSelect("INSERT INTO " + usersTable + " (name,password,chatList,isConnected,email) VALUES (\"" +
                    name + "\",\"" +
                    hash + "\",\"" +
                    mainChatName + "\",true,\"" +
                    email +
                    "\")");
          res=MySqlConnector.QuerySelect("SELECT id FROM "+usersTable+" WHERE email = \""+email+'\"');
          res.first();
          int userId=res.getInt("id");

          MySqlConnector.QueryNonSelect("UPDATE " + chatListTable + " SET connectedUsers = CONCAT(connectedUsers,\","+userId+"\") WHERE name = \""+mainChatName+"\"");
          ChatMessage message = new ChatMessage();
          String content="{\"chatname\":\""+mainChatName+"\",\"user\":\""+name+"\"}";
          message.setType(ChatMessage.MessageType.JOINCHAT);
          message.setContent(content);
          messagingTemplate.convertAndSend("/chat/messaging/"+mainChatName+chtUl,message);
          Runnable task = getNewThreadMessage(mainChatName,userId);
          String usList=generateUserList(mainChatName);
          Thread thread = new Thread(task);
          thread.start();
          return "{\"str\":\"Good\",\"userid\":"+userId+",\"nameu\":\""+name+"\",\"chatlist\":\""+mainChatName+"\",\"usermas\":"+usList+"}";
        }




    public String getUserListById(String usersId) throws SQLException {
        ResultSet res=MySqlConnector.QuerySelect("SELECT name FROM "+usersTable+" WHERE id IN ("+usersId+')');
        String result="";
        while (res.next())
        {
            result+=res.getString("name")+",";
        }
        result=result.substring(0,result.length()-1);
        return result;
    }

    public String generateUserList(String chatList) throws SQLException {
        String[] chatMas=chatList.split(",");
        String userList="[";
        for(String el:chatMas)
        {
            ResultSet res=MySqlConnector.QuerySelect("SELECT connectedUsers FROM "+chatListTable+" WHERE name = \""+el+'\"');
            res.first();
            String DBUsers=res.getString("connectedUsers");
            DBUsers=getUserListById(DBUsers);

            userList+="\""+DBUsers+"\", ";
        }
        userList=userList.substring(0,userList.length()-2);
        userList+="]";
        return userList;
    }
    public Runnable getNewThreadMessage(String DBchatList, int userId)
    {
        return () -> {
            String[] chatListArr=DBchatList.split(",");
            try {
                defineMaxTableMessage(chatListArr,userId);
            } catch (Exception e) {
                MySqlConnector.QueryNonSelect("UPDATE " + usersTable+ " SET isConnected = false WHERE id = "+userId);
                e.printStackTrace();
            }
        };
    }
    @MessageMapping("/chat.requestUserData")
    @SendTo("/chat/responseUserData")
    public String checkUserData(@Payload AutorizeForm userForm) throws SQLException {
        ResultSet res = MySqlConnector.QuerySelect("SELECT * FROM " + usersTable + " WHERE email = \"" + userForm.getUemail() + '\"');
        if (!res.first())
            return "{\"str\":\"Неверный адрес электронной почты\"}";
        int userId = res.getInt("id");
        try {

            boolean DBisConnected = res.getBoolean("isConnected");
            if (DBisConnected)
                return "{\"str\":\"Пользователь уже подключен к серверу\"}";
            String DBPassword = res.getString("password");
            String hash = CryptoKey.getKeyCode(userForm.getUpassword(), n);
            if (!DBPassword.equals(hash))
                return "{\"str\":\"Неверный пароль\"}";
            String DBUsername = res.getString("name");
            String DBchatList = res.getString("chatList");


            MySqlConnector.QueryNonSelect("UPDATE " + usersTable + " SET isConnected = true WHERE id = " + userId);
            String usList=generateUserList(DBchatList);
            Runnable task = getNewThreadMessage(DBchatList, userId);
            Thread thread = new Thread(task);
            thread.start();

            return "{\"str\":\"Good\",\"userid\":" + userId + ",\"nameu\":\"" + DBUsername + "\",\"chatlist\":\"" + DBchatList + "\",\"usermas\":" +usList  + "}";
        } catch (Exception ex)
        {
            MySqlConnector.QueryNonSelect("UPDATE " + usersTable+ " SET isConnected = false WHERE id = "+userId);
            ex.printStackTrace();
        }
        return "";
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/chat/messaging")
    public ChatMessage addUser(@Payload ChatMessage message,
        SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        headerAccessor.getSessionAttributes().put("uid", message.getUid());
        return message;
    }

}