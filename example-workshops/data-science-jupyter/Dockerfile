FROM ubuntu:latest

RUN apt update \
    && apt install -y openssh-server \
    && mkdir /var/run/sshd \
    && mkdir /root/.ssh \
    && chmod 700 /root/.ssh \
    && sed -i "s/^\(#\|\)PasswordAuthentication.*$/PasswordAuthentication no/" /etc/ssh/sshd_config

RUN apt update \
    && apt install -y python3-pip \
    && pip3 install --upgrade pip \
    && pip3 install notebook \
    && pip3 install numpy \
    && pip3 install pandas \
    && pip3 install matplotlib \
    && pip3 install seaborn

EXPOSE 22

COPY ./docker-entrypoint.sh /
COPY ./flight-data.csv /root/workshop/
COPY ./seabirds-visualization-full.ipynb /root/workshop/

WORKDIR /root/workshop

RUN chmod u+x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]