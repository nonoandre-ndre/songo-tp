# =====================================================================
#  Dockerfile — Version 2 du Songo (PHP + Apache) pour Render
#  Render ne fait pas tourner PHP nativement : on fournit donc une image
#  Docker. Cette image sert le dossier courant (api.php, index.html,
#  engine.js, style.css, remote.js, games/) via Apache + PHP 8.2.
# =====================================================================
FROM php:8.2-apache

# Copier tout le contenu du dossier version2-distante dans la racine web
COPY . /var/www/html/

# Autoriser l'écriture (api.php crée games/<id>.json)
RUN chown -R www-data:www-data /var/www/html

# Render fournit la variable d'environnement PORT (10000 par défaut).
# On configure Apache pour écouter sur ce port, puis on le lance.
EXPOSE 10000
CMD ["bash","-c","sed -i \"s/Listen 80/Listen ${PORT:-10000}/\" /etc/apache2/ports.conf && sed -i \"s/:80>/:${PORT:-10000}>/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
