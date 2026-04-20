package main

import (
	"context"
	"fmt"
	"os"

	garage "git.deuxfleurs.fr/garage-sdk/garage-admin-sdk-golang"
)

func main() {
	// Initialization
	configuration := garage.NewConfiguration()
	configuration.Host = "127.0.0.1:3903"
	client := garage.NewAPIClient(configuration)
	ctx := context.WithValue(context.Background(), garage.ContextAccessToken, "zNyHZSIDEAGXQINJK031riMyuWuCTsaPGrel4m5GcvU=")

	fmt.Println(client)
	// Nodes
	fmt.Println("--- nodes ---")
	nodes, res, err := client.NodeAPI.GetNodeInfo(ctx).Node("self").Execute()
	if err != nil {
		fmt.Println(res)
		panic(err)
	}
	fmt.Fprintf(os.Stdout, "First hostname: %v\n", nodes.Success)
	// capa := int64(1000000000)
	// change := []garage.NodeRoleChange{
	// 	garage.NodeRoleChange{NodeRoleUpdate: &garage.NodeRoleUpdate{
	// 		Id:       *nodes.KnownNodes[0].Id,
	// 		Zone:     "dc1",
	// 		Capacity: *garage.NewNullableInt64(&capa),
	// 		Tags:     []string{"fast", "amd64"},
	// 	}},
	// }
	// staged, _, _ := client.LayoutApi.AddLayout(ctx).NodeRoleChange(change).Execute()
	// msg, _, _ := client.LayoutApi.ApplyLayout(ctx).LayoutVersion(*garage.NewLayoutVersion(staged.Version + 1)).Execute()
	// fmt.Printf(strings.Join(msg.Message, "\n")) // Layout configured

	// health, _, _ := client.NodesApi.GetHealth(ctx).Execute()
	// fmt.Printf("Status: %s, nodes: %v/%v, storage: %v/%v, partitions: %v/%v\n", health.Status, health.ConnectedNodes, health.KnownNodes, health.StorageNodesOk, health.StorageNodes, health.PartitionsAllOk, health.Partitions)

	// // Key
	// fmt.Println("\n--- key ---")
	// key := "openapi-key"
	// keyInfo, _, _ := client.KeyApi.AddKey(ctx).AddKeyRequest(garage.AddKeyRequest{Name: *garage.NewNullableString(&key)}).Execute()
	// defer client.KeyApi.DeleteKey(ctx).Id(*keyInfo.AccessKeyId).Execute()
	// fmt.Printf("AWS_ACCESS_KEY_ID=%s\nAWS_SECRET_ACCESS_KEY=%s\n", *keyInfo.AccessKeyId, *keyInfo.SecretAccessKey.Get())

	// id := *keyInfo.AccessKeyId
	// canCreateBucket := true
	// updateKeyRequest := *garage.NewUpdateKeyRequest()
	// updateKeyRequest.SetName("openapi-key-updated")
	// updateKeyRequest.SetAllow(garage.UpdateKeyRequestAllow{CreateBucket: &canCreateBucket})
	// update, _, _ := client.KeyApi.UpdateKey(ctx).Id(id).UpdateKeyRequest(updateKeyRequest).Execute()
	// fmt.Printf("Updated %v with key name %v\n", *update.AccessKeyId, *update.Name)

	// keyList, _, _ := client.KeyApi.ListKeys(ctx).Execute()
	// fmt.Printf("Keys count: %v\n", len(keyList))

	// // Bucket
	// fmt.Println("\n--- bucket ---")
	// global_name := "global-ns-openapi-bucket"
	// local_name := "local-ns-openapi-bucket"
	// bucketInfo, _, _ := client.BucketApi.CreateBucket(ctx).CreateBucketRequest(garage.CreateBucketRequest{
	// 	GlobalAlias: &global_name,
	// 	LocalAlias: &garage.CreateBucketRequestLocalAlias{
	// 		AccessKeyId: keyInfo.AccessKeyId,
	// 		Alias:       &local_name,
	// 	},
	// }).Execute()
	// defer client.BucketApi.DeleteBucket(ctx).Id(*bucketInfo.Id).Execute()
	// fmt.Printf("Bucket id: %s\n", *bucketInfo.Id)

	// updateBucketRequest := *garage.NewUpdateBucketRequest()
	// website := garage.NewUpdateBucketRequestWebsiteAccess()
	// website.SetEnabled(true)
	// website.SetIndexDocument("index.html")
	// website.SetErrorDocument("errors/4xx.html")
	// updateBucketRequest.SetWebsiteAccess(*website)
	// quotas := garage.NewUpdateBucketRequestQuotas()
	// quotas.SetMaxSize(1000000000)
	// quotas.SetMaxObjects(999999999)
	// updateBucketRequest.SetQuotas(*quotas)
	// updatedBucket, _, _ := client.BucketApi.UpdateBucket(ctx).Id(*bucketInfo.Id).UpdateBucketRequest(updateBucketRequest).Execute()
	// fmt.Printf("Bucket %v website activation: %v\n", *updatedBucket.Id, *updatedBucket.WebsiteAccess)

	// bucketList, _, _ := client.BucketApi.ListBuckets(ctx).Execute()
	// fmt.Printf("Bucket count: %v\n", len(bucketList))
}
