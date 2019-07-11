package com.example.tools.mycrawler.baidu.entity;

import java.util.List;
import java.util.Map;

/**
 * Created by baogen.zhang on 2019/4/30
 *
 * @author baogen.zhang
 * @date 2019/4/30
 */
public class YunData {
    private Map<String, String> cookies;
    private String vip_end_time;
    private String expiredType;
    private FileList file_list;
    private String sign;
    private String task_time;
    private String sign2;
    private String sign1;
    private String sign3;
    private String uk;
    private String is_master_vip;
    private String ctime;
    private String is_evip;
    private String share_page_type;
    private String sharesuk;
    private String is_svip;
    private String visitor_avatar;
    private String pansuk;
    private String is_vip;
    private String loginstate;
    private String sampling;
    private String unlogin_user_in_small_flow;
    private String show_vip_ad;
    private String task_key;
    private String applystatus;
    private String bt_paths;
    private String linkusername;
    private String flag;
    private String visitor_uk;
    private String description;
    private String shareid;
    private String novelid;
    private String public_;
    private String is_auto_svip;
    private String bdstoken;
    private String timestamp;
    private String activity_end_time;
    private String need_tips;
    private String photo;
    private String timeline_status;
    private String face_status;
    private String curr_activity_code;
    //private List<String> title_img;
    private List<String> urlparam;
    private String errortype;
    private String XDUSS;
    private String third;
    private String self;
    private String is_master_svip;
    private String srv_ts;
    private String is_year_vip;
    private String username;

    public String getCookie() {
        if (cookies == null || cookies.size() == 0) {
            return "";
        }
        StringBuilder cookie = new StringBuilder();
        cookies.entrySet().stream().forEach(stringStringEntry -> {
            cookie.append(stringStringEntry.getKey() + ":" + stringStringEntry.getValue() + ";");
        });
        return cookie.substring(0, cookie.length() - 1);
    }

    public Map<String, String> getCookies() {
        return cookies;
    }

    public void setCookies(Map<String, String> cookies) {
        this.cookies = cookies;
    }

    public String getVip_end_time() {
        return vip_end_time;
    }

    public void setVip_end_time(String vip_end_time) {
        this.vip_end_time = vip_end_time;
    }

    public String getExpiredType() {
        return expiredType;
    }

    public void setExpiredType(String expiredType) {
        this.expiredType = expiredType;
    }

    public FileList getFile_list() {
        return file_list;
    }

    public void setFile_list(FileList file_list) {
        this.file_list = file_list;
    }

    public String getSign() {
        return sign;
    }

    public void setSign(String sign) {
        this.sign = sign;
    }

    public String getTask_time() {
        return task_time;
    }

    public void setTask_time(String task_time) {
        this.task_time = task_time;
    }

    public String getSign2() {
        return sign2;
    }

    public void setSign2(String sign2) {
        this.sign2 = sign2;
    }

    public String getSign1() {
        return sign1;
    }

    public void setSign1(String sign1) {
        this.sign1 = sign1;
    }

    public String getSign3() {
        return sign3;
    }

    public void setSign3(String sign3) {
        this.sign3 = sign3;
    }

    public String getUk() {
        return uk;
    }

    public void setUk(String uk) {
        this.uk = uk;
    }

    public String getIs_master_vip() {
        return is_master_vip;
    }

    public void setIs_master_vip(String is_master_vip) {
        this.is_master_vip = is_master_vip;
    }

    public String getCtime() {
        return ctime;
    }

    public void setCtime(String ctime) {
        this.ctime = ctime;
    }

    public String getIs_evip() {
        return is_evip;
    }

    public void setIs_evip(String is_evip) {
        this.is_evip = is_evip;
    }

    public String getShare_page_type() {
        return share_page_type;
    }

    public void setShare_page_type(String share_page_type) {
        this.share_page_type = share_page_type;
    }

    public String getSharesuk() {
        return sharesuk;
    }

    public void setSharesuk(String sharesuk) {
        this.sharesuk = sharesuk;
    }

    public String getIs_svip() {
        return is_svip;
    }

    public void setIs_svip(String is_svip) {
        this.is_svip = is_svip;
    }

    public String getVisitor_avatar() {
        return visitor_avatar;
    }

    public void setVisitor_avatar(String visitor_avatar) {
        this.visitor_avatar = visitor_avatar;
    }

    public String getPansuk() {
        return pansuk;
    }

    public void setPansuk(String pansuk) {
        this.pansuk = pansuk;
    }

    public String getIs_vip() {
        return is_vip;
    }

    public void setIs_vip(String is_vip) {
        this.is_vip = is_vip;
    }

    public String getLoginstate() {
        return loginstate;
    }

    public void setLoginstate(String loginstate) {
        this.loginstate = loginstate;
    }

    public String getSampling() {
        return sampling;
    }

    public void setSampling(String sampling) {
        this.sampling = sampling;
    }

    public String getUnlogin_user_in_small_flow() {
        return unlogin_user_in_small_flow;
    }

    public void setUnlogin_user_in_small_flow(String unlogin_user_in_small_flow) {
        this.unlogin_user_in_small_flow = unlogin_user_in_small_flow;
    }

    public String getShow_vip_ad() {
        return show_vip_ad;
    }

    public void setShow_vip_ad(String show_vip_ad) {
        this.show_vip_ad = show_vip_ad;
    }

    public String getTask_key() {
        return task_key;
    }

    public void setTask_key(String task_key) {
        this.task_key = task_key;
    }

    public String getApplystatus() {
        return applystatus;
    }

    public void setApplystatus(String applystatus) {
        this.applystatus = applystatus;
    }

    public String getBt_paths() {
        return bt_paths;
    }

    public void setBt_paths(String bt_paths) {
        this.bt_paths = bt_paths;
    }

    public String getLinkusername() {
        return linkusername;
    }

    public void setLinkusername(String linkusername) {
        this.linkusername = linkusername;
    }

    public String getFlag() {
        return flag;
    }

    public void setFlag(String flag) {
        this.flag = flag;
    }

    public String getVisitor_uk() {
        return visitor_uk;
    }

    public void setVisitor_uk(String visitor_uk) {
        this.visitor_uk = visitor_uk;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getShareid() {
        return shareid;
    }

    public void setShareid(String shareid) {
        this.shareid = shareid;
    }

    public String getNovelid() {
        return novelid;
    }

    public void setNovelid(String novelid) {
        this.novelid = novelid;
    }

    public String getPublic_() {
        return public_;
    }

    public void setPublic_(String public_) {
        this.public_ = public_;
    }

    public String getIs_auto_svip() {
        return is_auto_svip;
    }

    public void setIs_auto_svip(String is_auto_svip) {
        this.is_auto_svip = is_auto_svip;
    }

    public String getBdstoken() {
        return bdstoken;
    }

    public void setBdstoken(String bdstoken) {
        this.bdstoken = bdstoken;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getActivity_end_time() {
        return activity_end_time;
    }

    public void setActivity_end_time(String activity_end_time) {
        this.activity_end_time = activity_end_time;
    }

    public String getNeed_tips() {
        return need_tips;
    }

    public void setNeed_tips(String need_tips) {
        this.need_tips = need_tips;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public String getTimeline_status() {
        return timeline_status;
    }

    public void setTimeline_status(String timeline_status) {
        this.timeline_status = timeline_status;
    }

    public String getFace_status() {
        return face_status;
    }

    public void setFace_status(String face_status) {
        this.face_status = face_status;
    }

    public String getCurr_activity_code() {
        return curr_activity_code;
    }

    public void setCurr_activity_code(String curr_activity_code) {
        this.curr_activity_code = curr_activity_code;
    }

    public List<String> getUrlparam() {
        return urlparam;
    }

    public void setUrlparam(List<String> urlparam) {
        this.urlparam = urlparam;
    }

    public String getErrortype() {
        return errortype;
    }

    public void setErrortype(String errortype) {
        this.errortype = errortype;
    }

    public String getXDUSS() {
        return XDUSS;
    }

    public void setXDUSS(String XDUSS) {
        this.XDUSS = XDUSS;
    }

    public String getThird() {
        return third;
    }

    public void setThird(String third) {
        this.third = third;
    }

    public String getSelf() {
        return self;
    }

    public void setSelf(String self) {
        this.self = self;
    }

    public String getIs_master_svip() {
        return is_master_svip;
    }

    public void setIs_master_svip(String is_master_svip) {
        this.is_master_svip = is_master_svip;
    }

    public String getSrv_ts() {
        return srv_ts;
    }

    public void setSrv_ts(String srv_ts) {
        this.srv_ts = srv_ts;
    }

    public String getIs_year_vip() {
        return is_year_vip;
    }

    public void setIs_year_vip(String is_year_vip) {
        this.is_year_vip = is_year_vip;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
