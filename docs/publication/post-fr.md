# Shopify Community, Ask & Offer (français, pour référence)

Le forum Shopify Community est en anglais : publier la version anglaise. Ce texte sert à comprendre le message, pas à le publier tel quel.

---

## A. Nouveau sujet

**Titre :** Vérification gratuite d'un flux Google Shopping dans le navigateur (sans application, rien n'est envoyé)

Bonjour à tous,

Je travaille chez WeAdU, une agence spécialisée en publicité et en IA. Nous avons créé une page web gratuite qui vérifie un flux Google Shopping avant son envoi à Merchant Center : https://weadu-ltd.github.io/weadu-shopify-feed-check/

Vous collez votre flux (le fichier RSS, Atom ou CSV que votre application de flux génère au format Google) et la page liste les problèmes de chaque produit : champs obligatoires vides, titres de plus de 150 caractères, GTIN dont la clé de contrôle est fausse, prix nuls ou sans devise, identifiants en double. Une marque absente, ou un GTIN absent sans MPN, apparaît comme un avertissement, car certains produits en sont dispensés.

Pour être clair sur les limites : la page fonctionne dans le navigateur et n'envoie rien, il n'y a ni application à installer ni frais, mais elle ne lit ni l'administration Shopify ni un export produits Shopify, elle ne se connecte pas à Merchant Center, et un résultat sans constat n'est pas une validation par Google.

Transparence : je travaille chez WeAdU, qui a créé cette page. Elle est gratuite et open source.

## B. Réponse à une personne qui demande comment vérifier son flux

Bonjour [prénom], pour [son problème, par exemple « les erreurs de GTIN »], vous pouvez coller votre fichier de flux dans cette page gratuite : https://weadu-ltd.github.io/weadu-shopify-feed-check/. Elle fonctionne dans le navigateur (rien n'est envoyé) et liste, produit par produit, les champs obligatoires vides, les GTIN dont la clé de contrôle est fausse, les prix sans devise et d'autres problèmes du même type. Elle ne lit pas directement votre administration Shopify : il faut le fichier de flux généré par votre application. Transparence : je travaille chez WeAdU, qui l'a créée ; elle est gratuite.
