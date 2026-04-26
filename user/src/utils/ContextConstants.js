export const styles = [
    {
        label: "乡村",
        value: 1
    },
    {
        label: "华语流行",
        value: 2
    },
    {
        label: "原声带",
        value: 3
    },
    {
        label: "古典",
        value: 4
    },
    {
        label: "嘻哈说唱",
        value: 5
    },
    {
        label: "国风",
        value: 6
    },
    {
        label: "国风流行",
        value: 7
    },
    {
        label: "摇滚",
        value: 8
    },
    {
        label: "日本流行",
        value: 9
    },
    {
        label: "朋克",
        value: 10
    },
    {
        label: "欧美流行",
        value: 11
    },
    {
        label: "电子",
        value: 12
    },
    {
        label: "粤语流行",
        value: 13
    },
    {
        label: "节奏布鲁斯",
        value: 14
    },
    {
        label: "轻音乐",
        value: 15
    },
    {
        label: "非洲节拍",
        value: 16
    },
    {
        label: "韩国流行",
        value: 17
    },
]

export function getStyleName(styleId) {
    return styles.find(item => item.value === styleId).label;
}

export function getStyleId(styleName) {
    return styles.find(item => item.label === styleName).value;
}