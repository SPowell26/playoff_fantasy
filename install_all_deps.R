# Install all nflfastR dependencies
user_lib <- file.path(Sys.getenv("USERPROFILE"), "Documents", "R", "win-library", "4.5")

cat("Installing all nflfastR dependencies...\n")

# List of all required packages
packages <- c(
  "cachem", "memoise", "rappdirs", "pkgconfig", "cpp11", "jsonlite", 
  "cli", "curl", "data.table", "dplyr", "fastrmodels", "furrr", 
  "future", "glue", "janitor", "lifecycle", "nflreadr", "progressr", 
  "rlang", "stringr", "tibble", "tidyr", "xgboost", "nflfastR"
)

# Install each package
for (pkg in packages) {
  cat("Installing", pkg, "...\n")
  if (!require(pkg, quietly = TRUE, character.only = TRUE)) {
    install.packages(pkg, lib = user_lib, repos = "https://cran.rstudio.com/")
  }
}

cat("All dependencies installed!\n") 