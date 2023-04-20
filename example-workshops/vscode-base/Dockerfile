FROM ubuntu
RUN apt update \
    && apt install -y openssh-server \
    && mkdir /var/run/sshd \
    && mkdir /root/.ssh \
    && chmod 700 /root/.ssh \
    && sed -i "s/^\(#\|\)PasswordAuthentication.*$/PasswordAuthentication no/" /etc/ssh/sshd_config

EXPOSE 22

COPY ./docker-entrypoint.sh /
RUN chmod u+x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]