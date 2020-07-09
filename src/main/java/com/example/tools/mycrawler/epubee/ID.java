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
    private String id;
    private String eid;
    private String name;
    private Integer isVip;

    public String getId() {
        return id;
    }

    public String getEid() {
        return eid;
    }

    public String getName() {
        return name;
    }

    public Integer getIsVip() {
        return isVip;
    }

    public ID(String id, String eid, String name, Integer isVip) {

        this.id = id;
        this.eid = eid;
        this.name = name;
        this.isVip = isVip;
    }

    private static Logger logger = LoggerFactory.getLogger(ID.class);

    public static ID getNewId(String ip,String cookie) throws TimeoutException {
        Map<String, String> heads = new HashMap<>();
        heads.put("X-Forwarded-For", ip);
        heads.put("Content-Type", "application/json");
        heads.put("X-Requested-With", "XMLHttpRequest");

        Map<String, String> param = new HashMap<>();
        param.put("localid", "0");
        Map<String,String> map = HttpUtils.post("http://cn.epubee.com/keys/genid_with_localid.asmx/genid_with_localid", null, cookie, heads, "{localid:'0'}",3);
        if(map.get("responseCode").equals("503")){
            throw new TimeoutException("");
        }
        try {
            JSONObject jsonObject = ((JSONObject) ((JSONArray) JSON.parseObject(map.get("body")).get("d")).get(0));
            return new ID(jsonObject.getString("ID"),jsonObject.getString("eID"),jsonObject.getString("Name"),jsonObject.getInteger("isVip"));
        } catch (Exception e) {
            logger.error("注册失败！\n" + map.get("body") + "\n", e);
        }
        return null;
    }

    public static void main(String[] args) throws TimeoutException {
        ID a = ID.getNewId(IP.getNewIP(),null);
        System.out.println(a);
    }
}
