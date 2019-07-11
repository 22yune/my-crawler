package com.example.tools.mycrawler.epubee;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.tools.mycrawler.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class ID {

    private static Logger logger = LoggerFactory.getLogger(ID.class);

    public static String getNewId(String ip) throws TimeoutException {
        Map<String, String> heads = new HashMap<>();
        heads.put("X-Forwarded-For", ip);
        heads.put("Content-Type", "application/json");
        heads.put("X-Requested-With", "XMLHttpRequest");

        Map<String, String> param = new HashMap<>();
        param.put("localid", "0");
        Map<String,String> map = HttpUtils.post("http://cn.epubee.com/keys/genid_with_localid.asmx/genid_with_localid", null, null, heads, "{localid:'0'}",3);
        if(map.get("responseCode").equals("503")){
            throw new TimeoutException("");
        }
        try {
            return ((JSONObject) ((JSONArray) JSON.parseObject(map.get("body")).get("d")).get(0)).getString("ID");
        } catch (Exception e) {
            logger.error("注册失败！\n" + map.get("body") + "\n", e);
        }
        return null;
    }

    public static void main(String[] args) throws TimeoutException {
        String a = ID.getNewId(IP.getNewIP());
        System.out.println(a);
    }
}
