<template>
    <div class="image-upload">
        <Progress :percent="uploadProgress" status="active" v-if="uploading" />
        <div class="image-upload-preview" v-if="!uploading && result">
            <img v-lazy="ASSET_HOST + result" />
        </div>
        <Upload
            :disabled="uploading"
            accept="image/*"
            :show-upload-list="false"
            :action="ossHost"
            :data="uploadData"
            :on-error="onUploadError"
            :before-upload="onBeforeUpload"
            :on-success="onUploadSuccess"
            :on-progress="onUploadProgress"
            class="upload"
            ref="upload"
        >
            <Button :loading="uploading">
                <Icon type="ios-cloud-upload-outline" :size="18" />
                <span>{{ !this.result ? text : updateText }}</span>
            </Button>
        </Upload>
    </div>
</template>

<script>
/**
 * +----------------------------------------------------------------------
 * | 「e家宜业」
 * +----------------------------------------------------------------------
 * | Copyright (c) 2020-2024  All rights reserved.
 * +----------------------------------------------------------------------
 * | Licensed 未经授权禁止移除「e家宜业」和「卓佤科技」相关版权
 * +----------------------------------------------------------------------
 * | Author: 
 * +----------------------------------------------------------------------
 */

import { Upload, Button, Icon, Progress, Message } from 'view-design';
import Emitter from 'view-design/src/mixins/emitter';
import { ASSET_HOST } from '@/config';
import * as utils from '@/utils';

export default {
    name: 'ImageUpload',
    props: {
        width: Number,
        height: Number,
        value: String,
        dir: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: '上传图片'
        },
        updateText: {
            type: String,
            default: '修改图片'
        }
    },
    data() {
        return {
            ASSET_HOST,
            uploadData: {},
            uploading: false,
            uploadProgress: 0,
            result: this.value,
            ossHost: ASSET_HOST
        };
    },
    mixins: [Emitter],
    methods: {
        onBeforeUpload(file) {
            this.uploading = true;
            this.uploadProgress = 0;
            this.result = null;

            return new Promise((resolve, reject) => {
                utils.image.parse(file).then(
                    img => {
                        console.log('图片解析结果:', img);
                        console.log('要求尺寸:', { width: this.width, height: this.height });
                        
                        if (this.width && this.width !== img.width) {
                            Message.error(`请上传${this.width}宽度图片，当前图片宽度：${img.width}`);
                            this.uploading = false;
                            return reject();
                        } else if (this.height && this.height !== img.height) {
                            Message.error(`请上传${this.height}高度图片，当前图片高度：${img.height}`);
                            this.uploading = false;
                            return reject();
                        } else {
                            const key = `${this.dir}/${img.hash}${img.ext}`;
                            this.result = `/${key}`;
                            console.log('生成的上传key:', key);

                            utils.oss(key).then(res => {
                                console.log('OSS配置获取成功:', res);
                                this.uploadData = res;
                                this.ossHost = res.host;
                                resolve();
                            }).catch(error => {
                                console.error('获取OSS签名失败:', error);
                                Message.error('获取上传签名失败');
                                this.uploading = false;
                                reject(error);
                            });
                        }
                    },
                    (error) => {
                        console.error('图片解析失败:', error);
                        Message.error('图片文件解析失败');
                        this.uploading = false;
                        return reject(error);
                    }
                );
            });
        },
        onUploadProgress(e) {
            this.uploadProgress = Math.floor((e.loaded / e.total) * 100);
        },
        onUploadSuccess(response) {
            console.log('上传成功响应:', response);
            setTimeout(() => {
                this.uploading = false;
                this.$emit('input', this.result);
                this.$emit('on-change', this.result);
                this.dispatch('FormItem', 'on-form-change', this.result);
                this.$refs.upload.clearFiles();
            }, 1000);
        },
        onUploadError(error, response, file) {
            console.error('上传失败:', error, response, file);
            Message.error('上传错误：' + (response ? response.message || '服务器响应异常' : '网络连接失败'));
            this.uploading = false;
            this.result = null;
            this.$emit('input', '');
            this.$emit('on-change', '');
            this.dispatch('FormItem', 'on-form-change', '');
            this.$refs.upload.clearFiles();
        }
    },
    watch: {
        value(cur) {
            this.result = cur;
        }
    },
    components: {
        Upload,
        Button,
        Icon,
        Progress
    }
};
</script>

<style lang="less">
.image-upload {
    width: 100%;

    &-preview {
        margin-bottom: 20px;
        overflow: hidden;
        max-width: 680px;

        img {
            max-width: 100%;
        }
    }
}
</style>
