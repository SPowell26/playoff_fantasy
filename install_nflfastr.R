# Install nflfastR and required packages to user library
user_lib <- Sys.getenv("R_LIBS_USER")
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}

if (!require("nflfastR", quietly = TRUE)) {
  install.packages("nflfastR", lib = user_lib)
}

if (!require("jsonlite", quietly = TRUE)) {
  install.packages("jsonlite", lib = user_lib)
}

if (!require("dplyr", quietly = TRUE)) {
  install.packages("dplyr", lib = user_lib)
}

# Load libraries
library(nflfastR, lib.loc = user_lib)
library(jsonlite, lib.loc = user_lib)
library(dplyr, lib.loc = user_lib)

cat("nflfastR installation complete!\n") 