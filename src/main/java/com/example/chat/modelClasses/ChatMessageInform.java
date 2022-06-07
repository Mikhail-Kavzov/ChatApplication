package com.example.chat.modelClasses;

public class ChatMessageInform {
    private int messageid;
    private int uid;
    private String chtname;
    public int getMessageid() {
        return messageid;
    }
    public ChatMessageInform(int messageid, String chtName, int uid)
    {
        this.messageid=messageid;

        this.uid=uid;
        this.chtname=chtName;
    }
    public void setMessageid(int messageid) {
        this.messageid = messageid;
    }



    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }

    public String getChtname() {
        return chtname;
    }

    public void setChtname(String chtname) {
        this.chtname = chtname;
    }
}
