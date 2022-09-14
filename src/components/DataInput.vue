<template>
  <v-toolbar class="mt-5">
    <v-btn-toggle v-model="reportSource" mandatory>
      <v-btn :value="ReportSource.File"> File</v-btn>
      <v-btn :value="ReportSource.Url"> URL</v-btn>
    </v-btn-toggle>

    <VueFileAgent
      ref="fileAgent"
      v-if="reportSource === ReportSource.File"
      class="upload-block ma-2"
      :multiple="false"
      :deletable="true"
      :theme="'list'"
      @select="onFileChange"
      @beforedelete="onFileDeleted"
      helpText="Choose file"
      accept="application/json"
      :errorText="{
        size: 'This file is too large to be attached',
      }"
    />

    <ReportUrlFetcher
      :onNewReport="onNewReport"
      v-if="reportSource === ReportSource.Url"
      :presetUrl="this.presetUrl"
    />

    <v-autocomplete
      v-model="selectedTarget"
      clearable
      :disabled="vulnerabilityReport.length === 0"
      :items="vulnerabilityReport"
      item-text="Target"
      item-value="Target"
      :label="
        vulnerabilityReport.length === 0
          ? 'No targets available'
          : 'Select Target'
      "
      hide-details
    ></v-autocomplete>
  </v-toolbar>
</template>

<script lang="ts">
import Vue from "vue"
import VueFileAgent, { FileRecord } from "vue-file-agent"
import { Component, Prop, Ref, Watch } from "vue-property-decorator"
import {
  Version1OrVersion2,
  Vulnerability,
  VulnerabilityReportFile,
  VulnerabilityReportTarget,
} from "@/types"
import ReportUrlFetcher from "@/components/ReportUrlFetcher.vue"

enum ReportSource {
  File,
  Url,
}

Vue.use(VueFileAgent)
@Component({
  components: { ReportUrlFetcher },
})
export default class DataInput extends Vue {
  private selectedTarget = ""
  private reportSource = ReportSource.File
  private ReportSource = ReportSource
  @Prop() private presetUrl?: string
  @Ref() readonly fileAgent!: {
    deleteFileRecord: (fileRecordOrRaw: FileRecord) => void
  }

  mounted(): void {
    if (this.presetUrl) {
      this.reportSource = ReportSource.Url
    }
  }

  get selectedVulnerabilities(): Vulnerability[] {
    if (this.selectedTarget) {
      return this.vulnerabilityReport.find(
        (i) => i.Target === this.selectedTarget
      )?.Vulnerabilities
    } else {
      return this.vulnerabilityReport
        .filter((vr) => vr.Vulnerabilities)
        .flatMap((vr) => vr.Vulnerabilities)
    }
  }

  file: FileRecord | Record<string, never> = {}
  private vulnerabilityReport: VulnerabilityReportTarget[] = []

  @Watch("selectedTarget")
  public onNewTarget(): void {
    this.$emit("inputChanged", this.selectedVulnerabilities)
  }

  private parseFile(
    fileEvent: ProgressEvent<FileReader>
  ): VulnerabilityReportTarget[] {
    let vulnerabilityTargets: VulnerabilityReportTarget[]
    if (
      fileEvent?.target?.result &&
      typeof fileEvent.target.result === "string"
    ) {
      const parsedReport = JSON.parse(fileEvent.target.result)
      vulnerabilityTargets = this.extractTargetsFromReport(parsedReport)
    }
    return vulnerabilityTargets
  }

  private static isSchemaVersion2(
    obj: Version1OrVersion2
  ): obj is VulnerabilityReportFile {
    return !Array.isArray(obj) && obj.SchemaVersion >= 2
  }

  private extractTargetsFromReport(parsedReport: Version1OrVersion2) {
    let vulnerabilityTargets: VulnerabilityReportTarget[]
    if (DataInput.isSchemaVersion2(parsedReport)) {
      vulnerabilityTargets = parsedReport.Results
    } else {
      vulnerabilityTargets = parsedReport
    }

    vulnerabilityTargets.forEach((vr) =>
      vr.Vulnerabilities?.forEach((v) => (v.Target = vr.Target))
    )
    return vulnerabilityTargets
  }

  public onFileDeleted(fileRecord: FileRecord): void {
    this.fileAgent.deleteFileRecord(fileRecord)
  }

  @Watch("file")
  public onFileChange(files: FileRecord[]): void {
    const selectedFile = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const vulnerabilityTargets = this.parseFile(e)
      if (vulnerabilityTargets) {
        this.handleNewReport(vulnerabilityTargets)
      }
    }
    reader.readAsText(selectedFile.file)
  }

  public onNewReport(report: Version1OrVersion2): void {
    const vulnerabilityTargets = this.extractTargetsFromReport(report)
    this.handleNewReport(vulnerabilityTargets)
  }

  private handleNewReport(vulnerabilityTargets: VulnerabilityReportTarget[]) {
    this.vulnerabilityReport.splice(0)
    this.vulnerabilityReport.push(...vulnerabilityTargets)
    this.onNewTarget()
  }
}
</script>

<style scoped>
@import "~vue-file-agent/dist/vue-file-agent.css";
</style>
