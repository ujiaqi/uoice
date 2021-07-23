package com.uoice.music.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@Alias("banner")
@AllArgsConstructor
@NoArgsConstructor
public class Banner {
    private int id;
    private String pic;
}
