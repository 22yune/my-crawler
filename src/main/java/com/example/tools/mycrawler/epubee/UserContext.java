package com.example.tools.mycrawler.epubee;

import java.util.Random;
import java.util.concurrent.TimeoutException;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class UserContext {

    private String ip;

    private ID id;

    private int count;

    private String sessionId;

    public UserContext()  {
        init();
    }

    private void init(){
        try {
            next();
        } catch (TimeoutException e) {
            try {
                Thread.sleep(new Random().nextInt(10000));
            } catch (InterruptedException e1) {
                throw new RuntimeException("初始化失败，无法注册！");
            }
            init();
        }
    }

    public void used() throws TimeoutException {
        if (count == 3) {
            next();
        }
        count++;
    }

    private synchronized void next() throws TimeoutException {
        ip = IP.getNewIP();
        sessionId = Session.getSession(ip);
        id = ID.getNewId(ip,sessionId);
        count = 0;
    }

    public String getIp() {
        return ip;
    }

    public ID getId() {
        return id;
    }

    public String getCookie(){//ASP.NET_SessionId=hz5wufhxcyqk4wfyntsxgixv;
        return String.format("%s;identify=%s; eidentify=%s;identifyusername=; user_localid=%s; uemail=; kindle_email=; isVip=%d", sessionId,getId().getId(), getId().getEid(),getId().getName(),getId().getIsVip());
    }

    @Override
    public String toString() {
        return ip + "   " + id;
    }
}
