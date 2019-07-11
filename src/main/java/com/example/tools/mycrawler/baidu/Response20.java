package com.example.tools.mycrawler.baidu;

/**
 * 服务器返回的json，转java对象
 * 错误码为20 代表需要验证码
 *
 * @author gaoqiang
 */
public class Response20 {
    String errno;
    String request_id;
    String server_time;
    String vcode;
    String img;

    public String getErrno() {
        return errno;
    }

    public void setErrno(String errno) {
        this.errno = errno;
    }

    public String getRequest_id() {
        return request_id;
    }

    public void setRequest_id(String request_id) {
        this.request_id = request_id;
    }

    public String getServer_time() {
        return server_time;
    }

    public void setServer_time(String server_time) {
        this.server_time = server_time;
    }

    public String getVcode() {
        return vcode;
    }

    public void setVcode(String vcode) {
        this.vcode = vcode;
    }

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }
}