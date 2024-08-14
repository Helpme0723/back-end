export const calculateInsightCount = (newInsight, existingInsight) => {
  let viewCount = newInsight.viewCount;
  let likeCount = newInsight.likeCount;
  let commentCount = newInsight.commentCount;
  let salesCount = newInsight.salesCount;

  if (existingInsight) {
    viewCount -= existingInsight.totalViews;
    likeCount -= existingInsight.totalLikes;
    commentCount -= existingInsight.totalComments;
    salesCount -= existingInsight.totalSales;
  }

  return {
    viewCount,
    likeCount,
    commentCount,
    salesCount,
  };
};
