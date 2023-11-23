package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/go-ini/ini"
	log "github.com/sirupsen/logrus"
)

func init() {
	log.SetFormatter(&log.JSONFormatter{})

	log.SetOutput(os.Stdout)

	log.SetLevel(getLogLevel())
}

func main() {
	// Read in default config
	defaults, errD := readConfig(os.Getenv("DEFAULT_CONFIG"), true)
	customs, errC := readConfig(os.Getenv("CUSTOM_CONFIG"), false)
	output := os.Getenv("OUTPUT_FILE")

	// fatal but just in case
	if errD != nil {
		os.Exit(1)
	}

	defaultKVS := extractKVPairs(defaults.Sections())

	if errC != nil {
		err := writeEnvFile(output, defaultKVS)
		if err != nil {
			log.Error(err)
			os.Exit(1)
		}
		log.Infof("successfully generated %v file", output)
		os.Exit(0)
	}

	customKVs := extractKVPairs(customs.Sections())

	finalKVs := overwriteKVPairs(customKVs, defaultKVS)

	err := writeEnvFile(output, finalKVs)
	if err != nil {
		log.Error(err)
		os.Exit(1)
	}

	log.Infof("successfully generated %v file", output)
	os.Exit(0)
}

func readConfig(path string, required bool) (*ini.File, error) {
	log.Infof("reading config from %v", path)

	cfg, err := ini.Load(path)
	if err != nil {
		if required {
			log.Fatalf("failed to load config %v", path)
			return nil, err
		}
		log.Debugf("failed to load config %v but its not required", path)
		return nil, err
	}
	log.Infof("successfully read config from %v", path)
	return cfg, nil
}

func extractKVPairs(sections []*ini.Section) []KVS {
	var kvs []KVS
	for _, sec := range sections {
		keys := sec.Keys()
		for _, key := range keys {
			n := strings.ToUpper(key.Name())
			n = fmt.Sprintf("%v_%v", strings.ToUpper(sec.Name()), n)
			v := key.String()
			kv := KVS{
				key: n,
				val: v,
			}
			kvs = append(kvs, kv)
			log.Debugf("successfully extracted %v from config", kv.key)
		}
	}
	return kvs
}

func overwriteKVPairs(newkvs []KVS, oldkvs []KVS) []KVS {
	var finalkvs []KVS
	for _, oldkv := range oldkvs {
		for _, newkv := range newkvs {
			if oldkv.key == newkv.key {
				temp := KVS{
					key: oldkv.key,
					val: newkv.val,
				}
				log.Debugf("overwriting default %v with custom value", oldkv.key)
				finalkvs = append(finalkvs, temp)
			}
		}
	}
	return finalkvs
}

func writeEnvFile(path string, kvs []KVS) error {
	if _, err := os.Stat(path); err == nil {
		err := os.Truncate(path, 0)
		if err != nil {
			errMsg := fmt.Sprintf("failed to clear .env file: %v", err)
			return fmt.Errorf(errMsg)
		}
	}

	log.Infof("writing compiled configuration to %v", path)
	envFile, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("could not write to %v. error %v", path, err)
		return err
	}
	defer envFile.Close()

	for _, kv := range kvs {
		log.Debugf("writing %v to %v", kv.key, path)

		line := fmt.Sprintf("%s=%s\n", kv.key, kv.val)
		_, err := envFile.WriteString(line)
		if err != nil {
			log.Fatalf("could not %v to %v. error %v", kv.key, path, err)
			return err
		}
	}
	log.Infof("successfully compiled configuration to %v", path)
	return nil
}
