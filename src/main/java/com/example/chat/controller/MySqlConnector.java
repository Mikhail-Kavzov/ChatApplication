package com.example.chat.controller;

import java.sql.*;

public class MySqlConnector {

    private static final String url ="jdbc:mysql://localhost/chatdb?useUnicode=true&serverTimezone=UTC&useSSL=true&verifyServerCertificate=false";
    private static final String user = "root";
    private static final String password = "your password";

    private static Connection con;
    private static Statement stmt;
    private static ResultSet rs;


    synchronized public static ResultSet QuerySelect(String query)
    {
        try {
            con = DriverManager.getConnection(url, user, password);
            // getting Statement object to execute query
            stmt = con.createStatement();
            // executing SELECT query
            rs = stmt.executeQuery(query);

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return rs;

    }
    synchronized public static void QueryNonSelect(String query)
    {
        try {
            con = DriverManager.getConnection(url, user, password);
            // getting Statement object to execute query
            stmt = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_UPDATABLE);
            // executing SELECT query
            stmt.executeUpdate(query);

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        finally{
            closeResources();
        }

    }
    public static void closeResources()
    {
        try { con.close(); } catch(Exception se) { /*can't do anything */ }
        try { stmt.close(); } catch(Exception se) { /*can't do anything */ }
        try { rs.close(); } catch(Exception se) { /*can't do anything */ }
    }
}
