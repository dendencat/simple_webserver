FROM postgres:13

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create directories for certificates and key storage
RUN mkdir -p /etc/ssl/certs /app/keys

# Ensure the PostgreSQL data directory and certificates directory have the correct permissions
RUN chown -R postgres:postgres /var/lib/postgresql/data
RUN chown -R postgres:postgres /etc/ssl/certs

# Switch to the postgres user
USER postgres

# Set the custom entrypoint and command to activate SSL
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["postgres", "-c", "ssl=on", "-c", "ssl_cert_file=/etc/ssl/certs/server.crt", "-c", "ssl_key_file=/etc/ssl/certs/server.key"]