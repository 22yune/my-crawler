package com.example.tools.mycrawler.epubee;

import com.example.tools.mycrawler.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URLDecoder;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class ReadBook {
    private static Logger logger = LoggerFactory.getLogger(ReadBook.class);

    public static String readBook(String readUrl, UserContext user) throws TimeoutException{
        return readBook(readUrl, user, false);
    }
    public static String readBook(String readUrl, UserContext user,boolean recipe) throws TimeoutException{
        try {
            Map<String, String> heads = new HashMap<>();
            heads.put("X-Forwarded-For", user.getIp());
            heads.put("Accept-Language", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2");
            heads.put("Accept-Encoding", "gzip, deflate");
            heads.put("Upgrade-Insecure-Requests", "1");

            Map<String, String> response = HttpUtils.get(readUrl, "identify=" + user.getId(), heads);

            if (response == null || (!response.get("responseCode").equals("302"))) {
                if (response.get("responseCode").equals("200")) {
                    throw new TimeoutException("");
                }
                response = HttpUtils.get(readUrl, "identify=" + user.getId(), heads, 2, 20000);
            }
            String contextUrl ;
            if(recipe){
                String host = response.get("Location").replaceFirst("mobile/\\?rq=.*", "");
                 contextUrl = response.get("Location").replaceFirst(".*?rq=", "").replaceFirst("&.*", "");
                // window.decodeURIComponent(window.atob(encode_data).replace("+", "%20"))
                contextUrl = host + URLDecoder.decode(new String(Base64.getDecoder().decode(contextUrl), "utf-8").replace("+", "%20"),"UTF-8").replaceFirst("&.*","").replace("book=","");
            }else {
                contextUrl = response.get("Location").replace("?book=", "").replaceFirst("&.*", ".epub");
            }
            return contextUrl;
        } catch (Exception e) {
            if(e instanceof TimeoutException){
                throw (TimeoutException)e;
            }
            logger.error("读取失败！\n" + readUrl + "\n", e instanceof NullPointerException ? e.getMessage() : e);
        }
        return "";
    }

}
