Page({
    data: {
        url: '',
        title: ''
    },
    onLoad(query) {
        const { url, title } = query;
        const decodedUrl = url ? decodeURIComponent(url) : '';
        const decodedTitle = title ? decodeURIComponent(title) : '地图';
        this.setData({ url: decodedUrl, title: decodedTitle });
        wx.setNavigationBarTitle({ title: decodedTitle });
    }
});

