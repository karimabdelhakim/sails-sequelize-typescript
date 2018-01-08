#!/bin/bash
echo migration name?
read varname
node_modules/.bin/sequelize migration:generate --name  $varname