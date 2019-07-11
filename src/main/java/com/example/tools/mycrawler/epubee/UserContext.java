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

    private String id;

    private int count;

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
        id = ID.getNewId(ip);
        count = 0;
    }

    public String getIp() {
        return ip;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return ip + "   " + id;
    }
}
