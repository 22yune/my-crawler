package com.example.tools.mycrawler.baidu;

/**
 * Created by baogen.zhang on 2019/4/29
 *
 * @author baogen.zhang
 * @date 2019/4/29
 */
public class SetDataBean {
    private String sign;
    private String timestamp;
    private String bdstoken;
    private String uk;
    private String shareid;
    private FileList file_list;

    public String getSign() {
        return sign;
    }

    public void setSign(String sign) {
        this.sign = sign;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getBdstoken() {
        return bdstoken;
    }

    public void setBdstoken(String bdstoken) {
        this.bdstoken = bdstoken;
    }

    public String getUk() {
        return uk;
    }

    public void setUk(String uk) {
        this.uk = uk;
    }

    public String getShareid() {
        return shareid;
    }

    public void setShareid(String shareid) {
        this.shareid = shareid;
    }

    public FileList getFile_list() {
        return file_list;
    }

    public void setFile_list(FileList file_list) {
        this.file_list = file_list;
    }

    public static class FileList {
        String errno;
        List[] list;

        public String getErrno() {
            return errno;
        }

        public void setErrno(String errno) {
            this.errno = errno;
        }

        public List[] getList() {
            return list;
        }

        public void setList(List[] list) {
            this.list = list;
        }
    }

    public static class List {
        String app_id;
        String fs_id;
        String server_filename;
        String size;

        public String getApp_id() {
            return app_id;
        }

        public void setApp_id(String app_id) {
            this.app_id = app_id;
        }

        public String getFs_id() {
            return fs_id;
        }

        public void setFs_id(String fs_id) {
            this.fs_id = fs_id;
        }

        public String getServer_filename() {
            return server_filename;
        }

        public void setServer_filename(String server_filename) {
            this.server_filename = server_filename;
        }

        public String getSize() {
            return size;
        }

        public void setSize(String size) {
            this.size = size;
        }
    }
}