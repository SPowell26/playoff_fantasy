# Simple package installation script
cat("Installing required packages...\n")

# Create user library directory if it doesn't exist
user_lib <- file.path(Sys.getenv("USERPROFILE"), "Documents", "R", "win-library", "4.5")
if (!dir.exists(user_lib)) {
  dir.create(user_lib, recursive = TRUE)
}

cat("Installing to user library:", user_lib, "\n")

# Install packages if not already installed
if (!require("nflfastR", quietly = TRUE)) {
  cat("Installing nflfastR...\n")
  install.packages("nflfastR", lib = user_lib, repos = "https://cran.rstudio.com/")
}

if (!require("jsonlite", quietly = TRUE)) {
  cat("Installing jsonlite...\n")
  install.packages("jsonlite", lib = user_lib, repos = "https://cran.rstudio.com/")
}

if (!require("dplyr", quietly = TRUE)) {
  cat("Installing dplyr...\n")
  install.packages("dplyr", lib = user_lib, repos = "https://cran.rstudio.com/")
}

cat("Package installation complete!\n") 