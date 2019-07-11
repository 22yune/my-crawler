package com.example.tools.mycrawler.amazon;

import java.io.File;
import java.util.List;

/**
 * Created by baogen.zhang on 2019/7/2
 *
 * @author baogen.zhang
 * @date 2019/7/2
 */
public class Category {
    private List<String> dirs;
    private String category;
    private List<String> hrefs;

    public Category(List<String> dirs, String category, List<String> hrefs) {
        this.dirs = dirs;
        this.category = category;
        this.hrefs = hrefs;
    }

    public List<String> getDirs() {
        return dirs;
    }

    public String getCategory() {
        return category;
    }

    public List<String> getHrefs() {
        return hrefs;
    }

    @Override
    public String toString() {
        return String.join(File.separator, dirs) + File.separator + category + "  " + hrefs;
    }
}
