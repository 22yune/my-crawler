package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.HttpUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * <p><b>     </b></p><br>
 * <p>     <br>
 * <br><p>
 *
 * @author baogen.zhang          2020-07-09 14:16
 */
public class Session {

    public static String getSession(String ip){
        try{
            Map<String, String> heads = new HashMap<>();
            heads.put("X-Forwarded-For", ip);
            heads.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
            heads.put("Accept-Encoding", "gzip, deflate");
            heads.put("Upgrade-Insecure-Requests", "1");
            Map<String, String> response = HttpUtils.get("http://cn.epubee.com/books/", null, heads);

            if (response == null || (!response.get("responseCode").equals("200"))) {
                response = HttpUtils.get("http://cn.epubee.com/books/", null, heads, 2, 20000);
            }
            String[] ll =  response.get("cookie").split(";");
            for(String l : ll){
                if(l.startsWith("ASP")){
                    return l;
                }
            }
        }catch (Exception e){

        }
        return null;
    }
    public static void main(String[] args){
        String a = getSession("111.11.11.1");
        System.out.print(a);
    }
}
