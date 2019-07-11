package com.example.tools.mycrawler.epubee;

import java.util.Random;

/**
 * Created by baogen.zhang on 2019/6/24
 *
 * @author baogen.zhang
 * @date 2019/6/24
 */
public class IP {
    private static int Max = 254;

    private static Random random = new Random();
    private static int[] ip = new int[4];

    static {
        for (int i = 0; i < ip.length; i++) {
            ip[i] = random.nextInt(255);
        }
    }

    private static int circle = 3;

    private static void next(int circle) {
        if (ip[circle] < Max) {
            ip[circle] = ip[circle] + 1;
        } else if (circle == 0) {
            ip[0] = 1;
        } else {
            next(circle - 1);
            return;
        }
        for (; circle < 3; circle++) {
            ip[circle + 1] = 0;
        }
    }

    public static String getNewIP() {
        next(circle);
        return ip[0] + "." + ip[1] + "." + ip[2] + "." + ip[3];
    }
}
