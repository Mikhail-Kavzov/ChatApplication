package com.example.chat.modelClasses;

public class CryptoKey {
    public static String getKeyCode(String password, int n)
    {
        int H=100;
        for (int i=0;i<password.length();i++)
        {
            int sum=(H+password.charAt(i));
           H=(sum*sum)%n;
        }
        return Integer.toString(H);
    }
}
