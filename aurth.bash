curl -F grant_type=authorization_code \
-F client_id=u-s4t2ud-5e127fe7e4cb6429d6e17edb03ce13a5f5c22990183ff0b64925b6368928e79b \
-F client_secret=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 \
-F code=44f6638d8ddd91046d501e01f8231e3e57965c1cce4cefcf64d7d9a48f9e3798 \
-F redirect_uri=https://myawesomeweb.site/callback \
-X POST https://api.intra.42.fr/oauth/token

