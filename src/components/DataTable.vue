<template>
  <span>
    <v-text-field
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      outlined
      hide-details
      class="my-5"
    ></v-text-field>

    <v-tabs dark background-color="primary" grow hide-slider show-arrows>
      <v-tab v-on:click="search = ''"
        >Total: {{ vulnerabilityStats.total }}
      </v-tab>
      <v-tab v-on:click="search = ''"
        >Fixable: {{ vulnerabilityStats.fixable }}</v-tab
      >
      <v-tab
        v-for="severityInformation in vulnerabilityStats.severityInformation"
        :key="severityInformation.severity"
        v-on:click="search = severityInformation.severity"
      >
        {{ severityInformation.severity }}:
        {{ severityInformation.count }}
      </v-tab>
    </v-tabs>

    <v-data-table
      dense
      v-model="ignoredVulnerabilities"
      show-select
      :headers="headers"
      :items-per-page="20"
      :items="selectedVulnerabilities"
      item-key="id"
      class="elevation-1 mb-5"
      show-expand
      single-expand
      :sort-by="sortBy"
      :search="search"
      :expanded.sync="expanded"
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <h3>{{ item.Title }}</h3>
          <p>{{ item.Description }}</p>
          <p>
            <a :href="item.PrimaryURL">{{ item.PrimaryURL }}</a>
          </p>
        </td>
      </template>
    </v-data-table>
    <v-btn color="primary" class="mb-5" v-clipboard="() => this.ignoredCves">
      Copy .trivyignore to Clipboard
    </v-btn>
    <v-textarea
      outlined
      label=".trivyignore"
      :value="ignoredCves"
      readonly
    ></v-textarea>
  </span>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import { Vulnerability, VulnerabilitySeverityInformation } from "@/types"
import Clipboard from "v-clipboard"

Vue.use(Clipboard)

type VulnerabilityStats = {
  total: number
  fixable: number
  severityInformation: VulnerabilitySeverityInformation[]
}
@Component
export default class DataTable extends Vue {
  @Prop({ required: true }) selectedVulnerabilities: Vulnerability[]
  private ignoredVulnerabilities: Vulnerability[] = []
  private expanded: unknown[] = []
  private sortBy = "Severity"
  private search = ""

  get ignoredCves(): string {
    const uniqueCves = Array.from(
      new Set(this.ignoredVulnerabilities.map((v) => v.VulnerabilityID))
    ).map((id) => {
      return this.ignoredVulnerabilities.find((v) => v.VulnerabilityID === id)
    })
    const resultingLines: string[] = []
    uniqueCves.sort((a, b) => this.compareBySeverity(a.Severity, b.Severity))

    uniqueCves?.forEach((v) => {
      resultingLines.push(`# ${v.Severity}: ${v.Title}`)
      resultingLines.push(v.VulnerabilityID)
    })
    return resultingLines.join("\n")
  }

  get vulnerabilityStats(): VulnerabilityStats {
    const total = this.selectedVulnerabilities.length
    const fixable = this.selectedVulnerabilities.filter(
      (vulnerabilities) => vulnerabilities.FixedVersion != undefined
    ).length

    const vulnerabilitySeverityTypes: string[] = [
      ...new Set(this.selectedVulnerabilities.map((item) => item.Severity)),
    ]

    const severityInformation = vulnerabilitySeverityTypes
      .map((severity) => {
        return {
          severity,
          count: this.selectedVulnerabilities.filter(
            (vulnerabilities) => vulnerabilities.Severity === severity
          ).length,
        }
      })
      .sort((a, b) => this.compareBySeverity(a.severity, b.severity))
    return {
      total,
      fixable,
      severityInformation,
    }
  }

  private severitySortOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    UNKNOWN: 4,
  }

  private compareBySeverity(a: string, b: string): number {
    return this.severitySortOrder[a] - this.severitySortOrder[b]
  }

  private headers = [
    { text: "Target", value: "Target" },
    { text: "PkgName", value: "PkgName" },
    { text: "VulnerabilityID", value: "VulnerabilityID" },
    {
      value: "Severity",
      text: "Severity",
      sort: this.compareBySeverity,
    },
    { text: "InstalledVersion", value: "InstalledVersion" },
    { text: "FixedVersion", value: "FixedVersion" },
  ]
}
</script>

<style scoped></style>
