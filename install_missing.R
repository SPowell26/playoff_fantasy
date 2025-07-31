# Install missing dependency
user_lib <- file.path(Sys.getenv("USERPROFILE"), "Documents", "R", "win-library", "4.5")

cat("Installing missing cachem package...\n")
install.packages("cachem", lib = user_lib, repos = "https://cran.rstudio.com/")

cat("Installation complete!\n") 