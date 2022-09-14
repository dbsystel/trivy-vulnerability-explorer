<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col>
          <v-card color="#BBDEFB">
            <v-card-title class="headline"> Instructions</v-card-title>

            <v-card-subtitle>
              Select a JSON Report from
              <a href="https://github.com/aquasecurity/trivy" target="_blank"
                >Trivy</a
              >
              from your local file system. You may limit the displayed
              vulnerabilities to a single target. If you need, select the
              Vulnerabilities that you want to ignore/accept and use the
              .trivyignore output below for further processing in your pipeline.
              The data never leaves your browser, promised!
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
      <DataInput
        @inputChanged="reactivelySetNewVulnerabilities"
        :presetUrl="this.presetUrl"
      />
      <DataTable
        v-if="reportLoaded"
        :selectedVulnerabilities="selectedVulnerabilities"
      ></DataTable>
      <v-row v-else class="my-2"
        ><v-col>
          <v-alert border="top" colored-border type="info" elevation="2">
            There is no data to display yet. Try to load a trivy report by using
            the file uploader above.
          </v-alert></v-col
        ></v-row
      >
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import DataInput from "@/components/DataInput.vue" // @ is an alias to /src
import { Vulnerability } from "@/types"
import DataTable from "@/components/DataTable.vue"
import { Component, Prop } from "vue-property-decorator"

@Component({
  components: {
    DataTable,
    DataInput,
  },
})
export default class Home extends Vue {
  @Prop() private presetUrl?: string
  private selectedVulnerabilities: Vulnerability[] = []
  private reportLoaded = false

  private reactivelySetNewVulnerabilities(newVulnerabilities: Vulnerability[]) {
    this.selectedVulnerabilities.splice(0)
    newVulnerabilities.forEach(
      (item: Vulnerability, index: number) => (item.id = index)
    )
    this.selectedVulnerabilities.push(...newVulnerabilities)
    this.reportLoaded = true
  }
}
</script>
