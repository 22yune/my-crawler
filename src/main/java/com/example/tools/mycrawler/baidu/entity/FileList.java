package com.example.tools.mycrawler.baidu.entity;

import java.util.List;

/**
 * Created by baogen.zhang on 2019/4/30
 *
 * @author baogen.zhang
 * @date 2019/4/30
 */
public class FileList {

    private String errno;
    private List<FileInfo> list;

    public String getErrno() {
        return errno;
    }

    public void setErrno(String errno) {
        this.errno = errno;
    }

    public List<FileInfo> getList() {
        return list;
    }

    public void setList(List<FileInfo> list) {
        this.list = list;
    }
}
