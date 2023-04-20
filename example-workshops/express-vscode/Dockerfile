FROM ubuntu

RUN apt update \
    && apt install -y openssh-server \
    && mkdir /var/run/sshd \
    && mkdir /root/.ssh \
    && chmod 700 /root/.ssh \
    && sed -i "s/^\(#\|\)PasswordAuthentication.*$/PasswordAuthentication no/" /etc/ssh/sshd_config

RUN apt update \ 
    && apt install -y nodejs npm \
    && npm install -g express-generator@4

RUN express /root/workshop && cd /root/workshop \
    && npm install

EXPOSE 22

COPY ./docker-entrypoint.sh /

WORKDIR /root/workshop

RUN chmod u+x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]