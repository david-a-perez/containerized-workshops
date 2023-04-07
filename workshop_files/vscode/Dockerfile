FROM ubuntu
RUN apt update \
    && apt install -y openssh-server \
    && mkdir /var/run/sshd \
    && mkdir /root/.ssh \
    && chmod 700 /root/.ssh \
    && sed -i "s/^\(#\|\)PasswordAuthentication.*$/PasswordAuthentication no/" /etc/ssh/sshd_config

RUN echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDeRBp+0/rqj0Gdxecal1QQwFqdip7fTYT7Bvleob9lffgfq+wFY8d4Abn99HX+5++voanBsBiOWDx8ZWYzBzzw7KWUsPgtKRfY/v58oZExCdvj4AxVBEsiDJn2usRqTnsq/E3XD10FHw18Tycozd65FybbqUCBHL3RL2g1dZ5o1+qe3suTVy4qc4AIFMlHkuP40DjGcShy0QpG+HtLVx7HMynjbKjR0ZW3gb+k3ICplfkhB9QrIGoBDwkkgGE/DNQMmHQZLcsZLH04HQSBc1mx0BPVgudoszpFSD8/kpUYpto5Se7cJY6PL2G6AqGXnzcNDPTirQ5Ha/fHuKCLMaCQ6w+95sQSImVpgA85h8phpELIN4LEizFE7InGYGgYAITX6l4KvxzynfixvnoOboMDpDSXzcfES0sUvXhx43733xDyepM1LLzgXwbfssLAn+Rw7S7T90Ioa4uM+aj1aOQTYLB3GCsBaxHAPtmZEsUkRUynfiDkTT32wJWicP6N0nKxE4ufNdBDTQsdxnvyF/rDK3AHv0rJ1ynR/xNAzRyrPcNfTB77kSjMDMLNxjmpDxNcTpR+VBpbRXl0t7pQtSRQE2m2ijylFhOMwr1EVv0uKz8/lhbi+zFQhekcdLKtH7gAUSME4mHEIB/WwO9nQ6bUzSMcoQb6bi5FJ2/pHB0UIQ== " >>/root/.ssh/authorized_keys

EXPOSE 22
COPY ./docker-entrypoint.sh /
RUN chmod u+x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
