package com.uoice.music.bean;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("recommend")
public class Recommend {
    int id;
    String name;
    String coverImgUrl;
    String picUrl;
    String description;

}
