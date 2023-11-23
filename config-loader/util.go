package main

import (
	"os"

	"strings"

	log "github.com/sirupsen/logrus"
)

func getLogLevel() log.Level {

	lvl := strings.ToUpper(os.Getenv("LOG_LEVEL"))
	if lvl == "DEBUG" {
		return log.DebugLevel
	}
	if lvl == "INFO" {
		return log.InfoLevel
	}
	if lvl == "WARNING" {
		return log.WarnLevel
	}
	if lvl == "ERROR" {
		return log.ErrorLevel
	}
	if lvl == "FATAL" {
		return log.FatalLevel
	}
	return log.InfoLevel
}
