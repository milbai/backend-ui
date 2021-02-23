#!/usr/bin/env bash
docker build -t registry.cn-shenzhen.aliyuncs.com/jetlinks/jetlinks-ui-antd:1.0-SNAPSHOT .
docker push registry.cn-shenzhen.aliyuncs.com/jetlinks/jetlinks-ui-antd:1.0-SNAPSHOT


docker login --username=songll1688 registry.cn-beijing.aliyuncs.com
docker tag [ImageId] registry.cn-beijing.aliyuncs.com/rwslinks/rwslinks-ui:latest
docker push registry.cn-beijing.aliyuncs.com/rwslinks/rwslinks-ui:latest

docker build -t registry.cn-beijing.aliyuncs.com/rwslinks/rwslinks-ui:latest